# G0 du lot TRANSPORT-500-SCHEMA-1 (contrat 1.1.0) : le 500 publié par `/openapi.json` dit tout ce que le serveur envoie

- **Item** : TRANSPORT-500-SCHEMA-1 (`docs/ETAT.md` de `lot/etude-suite`), né de N-4 de la G2 de C' 3c-4a (`recherches:coordination/pieces/2026-10-04-G2-recherches/G2-c-prime-3c-4a.md`). Porteur : RECHERCHES. Déclencheur : avant la NOTICE de T−7 (le contrat publié doit dire vrai).
- **Base** : `base/chantier-moteur-2026-10-03` à `bc8deef3` (elle porte 3c-4a #164 et 3c-4b #167). Branche `recherches/transport-500-schema-1`, aucune PR.
- **Statut** : G0 court, écrit avant les tests rouges et le gel. Auteur : RECHERCHES.

## 1. Défaut

- `apps/harness/src/server.ts:172-174` : toute levée dans `handleNodeRequest` (lecture du corps, construction de la requête, routage, ou une levée du miroir hors de ses propres `try`, par exemple pendant la mise en forme de la réponse 200) répond `500` avec le corps `{"error":"internal_error"}`, **sans `operation`**. Ce chemin sert les deux surfaces, donc aussi `POST /{op}` sur `api.`.
- `apps/harness/src/openapi.ts:91-94` publie pour chaque opération un `500` dont le schéma est `TOOL_ERROR_500_SCHEMA`, la projection de `$defs/InternalError` de `schemas/tool-error.schema.json` : `operation` y est requis, `additionalProperties` faux. Un client qui valide les 500 avec `/openapi.json` refuse donc le 500 de transport.
- Le fichier gelé, lui, dit vrai : sa description nomme ce corps hors de ses branches (« Not described here: … and a transport-level 500 without operation (`{"error":"internal_error"}`) »). Le défaut est seulement dans le document OpenAPI.

## 2. Construction retenue : OpenAPI décrit exactement ce que le serveur envoie

Deux constructions étaient possibles.

1. **Donner au 500 de transport les champs que `InternalError` exige** (`operation` tiré du chemin). Écartée : la description du schéma gelé publie le 500 de transport comme un corps **sans** `operation`. Le serveur cesserait d'envoyer ce que le contrat gelé (qu'on ne peut pas toucher) annonce, et le contrat publié dirait faux d'une autre façon. Elle demande aussi une `operation` inventée là où il n'y en a pas : requête sur la surface MCP, chemin vide, `Host` illisible (la levée a lieu avant le routage), et un repli pour `minLength: 1`.
2. **Retenue** : le serveur ne change pas ; la réponse `500` de `/openapi.json` devient `oneOf` de deux branches, toutes deux tirées du fichier gelé par `schema-projection.ts` (seul lecteur des fichiers gelés, K-8) :
   - la projection de `$defs/InternalError`, inchangée (500 d'une opération : sortie hors contrat `output_invalid`, ou levée de l'outil) ;
   - le 500 de transport : `InternalError` restreint à sa seule propriété `error` (`required: ["error"]`, `additionalProperties: false` et `type` repris de la définition gelée), soit exactement `{"error":"internal_error"}`, le corps que la description gelée nomme.
   Les deux branches s'excluent (`operation` requise d'un côté, interdite de l'autre). La description du `500` dans `openapi.ts` nomme les deux cas. Aucun code n'est écrit en littéral (cliquet C-3), aucun `$ref` ne reste.

Le fichier gelé et le paquet gelé ne sont pas touchés. Aucun corps servi ne change ; seul `/openapi.json` change.

## 3. Tests (rouges à la base)

- **T-1, neuf** (`apps/harness/test/server.test.ts`) `every_500_of_the_server_validates_the_published_500_schema` : serveur réel sur la boucle locale (`startServer`), schéma `500` lu dans `buildOpenApi()` (le corps de `/openapi.json`), identique pour les quatre opérations, compilé par Ajv 2020 en mode strict. Chaque chemin 500 du serveur doit le valider : (a) `output_invalid` (sortie hors schéma), (b) levée de l'outil, (c) 500 de transport sur `api.` (`POST /calibrate`, une levée hors des `try` du miroir), (d) 500 de transport avant le routage (`Host` illisible). Les corps de (c) et (d) sont affirmés égaux à `{"error":"internal_error"}`. Contre-épreuves : `operation` vide et une clé de plus sont refusées. Rouge à la base : (c) et (d) ne valident pas `InternalError` seul. Tueur : la ligne du `oneOf` dans `schema-projection.ts`, branche de transport retirée.
- **T-2, adapté** (`apps/harness/test/openapi.test.ts`) `openapi_400_and_500_are_the_tool_error_projections` : le `500` attendu devient `oneOf` [projection indépendante d'`InternalError`, corps de transport écrit à la main dans le test]. Tueur inchangé (`openapi.ts:86`).

## 4. Ré-épinglages attendus

`/openapi.json` change (schéma et description du `500`) : `PENDING_BODIES_SHA256["/openapi.json"]` (`test/harness-served.test.ts`) ; `node scripts/sync-harness-served.mjs --pending` réécrit `harness-pending.json` (attendu : `written_at` et `openapi_sha256` seuls) ; entrée du manifeste du site et `PINNED`. Aucun autre corps servi, aucune trace, aucun fichier d'ukemi ne bouge (à vérifier au gel).

## 5. R-25

Estimation : **~80 lignes** (code ~12, tests ~55, épingles ~6, hors `docs/`), borne 547.

## 6. Hors périmètre

Le `413` (`payload_too_large`) que `POST /{op}` peut recevoir n'est pas listé par `/openapi.json` : c'est une absence, pas une contradiction (le fichier gelé le dit non décrit). Les 500 de la surface MCP ne sont pas décrits par OpenAPI ; leur corps est le même que celui du transport.
