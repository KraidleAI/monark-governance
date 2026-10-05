# G7 du lot TRANSPORT-500-SCHEMA-1 (contrat 1.1.0) : le 500 publié par `/openapi.json` dit tout ce que le serveur envoie

- **Plan** : `docs/G0-lot-transport-500-schema-1.md` (`f61c9143`). Item TRANSPORT-500-SCHEMA-1 (`docs/ETAT.md` de `lot/etude-suite`), N-4 de la G2 de C' 3c-4a (`recherches:coordination/pieces/2026-10-04-G2-recherches/G2-c-prime-3c-4a.md`). Déclencheur : avant la NOTICE de T−7.
- **Base** : `base/chantier-moteur-2026-10-03` à `bc8deef3` (3c-4a #164 et 3c-4b #167 fusionnés).
- **Commits** (branche `recherches/transport-500-schema-1`, aucune PR) :
  - `f61c9143` G0 ;
  - `d233de2d` tests (rouges à la base) ;
  - **`8faf19fa` gel** : code et ré-épinglages ;
  - `07d560d2` ce G7 ;
  - pli de la G2 : `651e4666` (tests, rouges à `07d560d2`), **`ef435397` gel du pli** (code et ré-épinglages), puis le commit de cette mise à jour du G7 (section « Pli de la G2 »).
- Aucun `git add -A` ; `packages/rpc-guard/bin/rpc-guard.mjs` jamais indexé. `schemas/*.json` et le paquet gelé non touchés. `apps/harness/src/server.ts` et `http.ts` non touchés : aucun corps servi ne change.

## Ce que le lot écrit

1. **Construction** (G0 §2, option 2) : `apps/harness/src/schema-projection.ts:119-129`. `TOOL_ERROR_500_SCHEMA` devient `{ oneOf: [INTERNAL_500, TRANSPORT_500] }` :
   - `INTERNAL_500` : la projection de `$defs/InternalError`, inchangée (500 d'une opération : `output_invalid`, ou levée de l'outil ; `operation` requise) ;
   - `TRANSPORT_500` : `InternalError` restreint à sa seule propriété `error` (`type` et `additionalProperties: false` repris de la définition gelée, `required: ["error"]`, `properties.error` lu dans la définition gelée, échec fermé par `asObject` s'il manque). C'est exactement `{"error":"internal_error"}`, le corps que `server.ts:174` envoie et que la description gelée nomme (« a transport-level 500 without operation »).
   Les deux branches s'excluent (`operation` requise d'un côté, interdite de l'autre). Aucun code en littéral (cliquet C-3), aucun `$ref` dans le document.
2. **Description du 500** (`apps/harness/src/openapi.ts:92`) : « The tool output broke its frozen contract, or the tool failed (both name the operation); or the request failed in transport (no operation); never a stack. »

**Pourquoi pas l'option 1** (donner une `operation` au 500 de transport) : la description du schéma gelé publie ce 500 comme un corps sans `operation`. Le serveur aurait cessé d'envoyer ce que le contrat gelé annonce, et une `operation` aurait dû être inventée là où il n'y en a pas (surface MCP, `Host` illisible avant le routage, chemin vide face à `minLength: 1`). L'option 2 laisse le serveur et le fichier gelé vrais, et rend OpenAPI vrai.

## Liste des changements servis de ce lot (pour MONARK)

Rien n'est servi avant T0. Seul `/openapi.json` change (schéma et description du `500` des quatre opérations ; après le pli de la G2, aussi une réponse `413` listée) : empreinte `ccae5fc0…844f` → `ca605b3b…c3f6` (gel) → **`de635be9d7708036add1b85427749539f0aa4190db63203ffac96d7a0a857ba1`** (gel du pli, empreinte finale à annoncer). Aucun corps de réponse d'opération, aucune décision, aucune trace ne bouge.

## Ré-épinglages (dans le commit du gel, `8faf19fa`)

- `PENDING_BODIES_SHA256["/openapi.json"]` (`test/harness-served.test.ts:664`) : `ccae5fc0…` → `ca605b3b…`. Les trois autres corps (`/gate`, `/gate liquidation-eligible-coverage`, `/calibrate`) ne bougent pas.
- `node scripts/sync-harness-served.mjs --pending` : `harness-pending.json` réécrit, **seuls `written_at`** (`2026-10-05T14:57:37.497Z` → `2026-10-05T16:20:15.411Z`) **et `openapi_sha256`** (`ca605b3b…`) changent ; `pending_since` gardé, `harness-served.json` inchangé à l'octet (`30afbec2…`). Entrée du manifeste du site et `PINNED` (`test/harness-served.test.ts:51`) : `f874bb44…2fb3` → **`38d8b71f7531023cc4075ae5a17a029593f954d40b3655880da8992bc76c1272`**.
- `node scripts/sync-ukemi-served.mjs --pending` lancé puis **annulé** : seul `written_at` bougeait (aucun champ partagé) ; `ukemi-pending.json` et son entrée restent `220c14c9…`.

## Tests et tueurs (forme fermée)

| Test | Tueur | Tiré |
|---|---|---|
| `every_500_of_the_server_validates_the_published_500_schema` (neuf, `apps/harness/test/server.test.ts`) | `apps/harness/src/schema-projection.ts:129 CONST "[INTERNAL_500, TRANSPORT_500]" -> "[INTERNAL_500]"` | tué |
| `openapi_400_and_500_are_the_tool_error_projections` (adapté : le 500 attendu est `oneOf` [projection indépendante d'`InternalError`, corps de transport écrit à la main]) | `apps/harness/src/openapi.ts:86 CONST "TOOL_ERROR_400_SCHEMA" -> "TOOL_ERROR_500_SCHEMA"` (inchangé) | tué |

Le test neuf démarre un vrai serveur (`startServer` sur la boucle locale), lit le schéma `500` dans `buildOpenApi()` (le corps de `/openapi.json`), vérifie qu'il est le même pour les quatre opérations, le compile avec Ajv 2020 en mode strict, et fait passer par le fil chaque chemin 500 du serveur : (a) `output_invalid`, (b) levée de l'outil, (c) 500 de transport autour du miroir (`POST /calibrate` sur `api.`, levée hors des `try` de `http.ts`, attrapée par `server.ts:172`), (d) 500 de transport avant le routage (`Host` illisible, levée dans `toWebRequest`). (a) et (b) nomment `calibrate` ; (c) et (d) sont affirmés égaux à l'octet à `{"error":"internal_error"}`. Contre-épreuves : `operation` vide, une clé de plus et un autre `error` sont refusés (le schéma reste fermé). À la base, (c) et (d) ne valident pas `InternalError` : rouge par assertion.

## red-proof

`node scripts/red-proof.mjs --base f61c9143 --gel 8faf19fa --repo . --draw 2 --seed 37` : **sortie 0, 2 jugés, 25 inchangés, 2 F2P, 2 tueurs tirés, 2 tués** ; `RED-PROOF.json` sha256 `cf5a6537e759…` (dépend des chemins). Aucun test refusé : aucun durcissement refusé à tirer à la main. Le tueur neuf a aussi été tiré à la main avant le commit des tests (rouge par assertion, vert une fois la ligne rendue). Les épingles de `test/harness-served.test.ts` sont hors des corps de test (non jugées).

## Ancres

`verifie-ancres.mjs . --touched origin/base/chantier-moteur-2026-10-03 HEAD` : **17 tueurs, 17 ancrés, 0 dérivé, 0 perdu**.

## Contrôles

Node 24.21.0, variables de proxy retirées pour les tests, TMPDIR propre à la session. `node_modules` : copies à liens durs de celui de `monark-governance-cprime`, `@monark` en liens relatifs vers les `packages/` et `apps/` de cet arbre (non indexé).

| Contrôle | Commande | Résultat |
|---|---|---|
| `npm test` complet | `npm test` | **2 548 tests, 2 526 verts, 0 rouge, 22 sautés, 0 annulé, exit 0** |
| `tsc` | `npx tsc --noEmit` | 0 erreur |
| `lint` | `npx eslint .` | 0 erreur |
| `lint:ratchet` | `npm run lint:ratchet` | 69/69 |
| `gate:vocab` | `npm run gate:vocab` | OK (346 fichiers) |
| `lang:gate` | `npm run lang:gate` | OK |
| `export:check` | `npm run export:check` | OK |
| site | `npm run build -w @monark/site` puis `node scripts/assert-fleet-html.mjs` | build vert ; `assert-fleet-html` OK (quatre assertions) |

## R-25

`r25()` de `scripts/oracle/r25.mjs` contre `origin/base/chantier-moteur-2026-10-03` (`bc8deef3`), au gel : **STAT 78** (+67 / −11) ≤ 547 ; CONTENT_STAT 0. Estimation du G0 : ~80.

## Écarts au G0

Aucun sur la construction. Le cas (b) du test neuf (levée de l'outil) et la contre-épreuve « autre `error` » s'ajoutent à ce que le G0 listait ; le test passe par `POST /calibrate` (corps d'entrée le plus court) au lieu de `/gate`.

## Questions ouvertes

- **Q-T500-1** : le `413` (`payload_too_large`) n'était pas listé par `/openapi.json`. **Décision de la cellule : le lister maintenant, avant la NOTICE de T−7, pour que l'empreinte ne bouge qu'une fois.** Plié (voir « Pli de la G2 », R-1).
- **Q-T500-2** : la branche `TRANSPORT_500` est dérivée d'`InternalError`, pas lue d'une définition gelée. **Décision : dérivation acceptée pour 1.1.0** ; une `$defs/TransportError` gelée est visée pour la version suivante du contrat (la projection deviendra directe).
- N-5 de C' (gel profond des constantes) reste ouvert. Le cœur de N-2 de C' (`inlineDefs` : voisins d'un `$ref`, définition récursive) reste ouvert sous SCHEMA-PROJECTION-FAIL-CLOSED-1 ; les deux gardes de ce lot (N-1, N-2 de la G2 de ce lot) en couvrent la partie qui touche le `500`.

## Pli de la G2

G2 : `recherches:coordination/pieces/2026-10-04-G2-recherches/G2-transport-500-schema-1.md` (`f018db2`), **approuvé avec réserves**, aucun bloquant. La base n'a pas bougé (`bc8deef3`, refspec explicite relue) : aucune fusion.

### Pliés

- **R-1 / Q-T500-1 : le `413` listé.** `apps/harness/src/openapi.ts:91` : `"413": { description: "The request body is larger than the harness cap (payload_too_large); the connection is closed." }`, sur le modèle du `403` : description seule, sans schéma (le fichier gelé ne décrit pas ce corps ; aucun schéma écrit à la main). `scripts/sync-harness-served.mjs:233` : la liste exacte des réponses de `/gate` devient 200, 400, 403, 413 et 500 (sans cela `--pending` et la promotion échouent fermé). Le `404` et le `405` (chemins ou méthodes non décrits) restent hors d'OpenAPI.
- **N-1 : exclusion des branches gardée au chargement.** `TOOL_ERROR_500_SCHEMA` est construit par `internal500Schema(internal)` (exportée, `schema-projection.ts:130-138`), qui lève si `InternalError.additionalProperties !== false` ou si `required` ne contient pas `operation` (« the two 500 branches would overlap »). Le mutant gelé F10 de la G2 (`operation` optionnelle) échoue désormais au chargement du module, donc à l'amorçage du serveur, et plus seulement par le test sur le fil.
- **N-2 : branche de transport tirée d'une liste fermée de clés.** `TRANSPORT_500_KEYS = ["type", "additionalProperties"]` (`:123`) remplace l'étalement de la définition gelée ; s'y ajoutent `required: ["error"]` et `properties.error` lue dans la définition. Une clé future d'`InternalError` (`minProperties`, `allOf`…) reste dans la branche `InternalError` et n'entre plus dans celle du transport (mutants F3 et F5 de la G2). Les octets du document ne changent pas par ce refactor : en retirant le `413`, l'empreinte du gel du pli redonne exactement `ca605b3b…`.
- Ces deux gardes relèvent du périmètre de **SCHEMA-PROJECTION-FAIL-CLOSED-1** (partie `500`) ; l'item reste ouvert pour `inlineDefs`.
- **N-4 (correction du G0 §6)** : la phrase « Les 500 de la surface MCP […] leur corps est le même que celui du transport » est **inexacte**. Elle ne vaut que pour le `catch` de `server.ts:172-174` ; le SDK MCP renvoie ses propres 500 au format JSON-RPC (`internalServerErrorResponse`, `@modelcontextprotocol/server/dist/index.mjs:1313`, aussi `:1030`, `:1349`, `:1358`). Ils sont hors OpenAPI (« MCP errors » non décrites par le fichier gelé). Le G0 n'est pas réécrit ; cette ligne le corrige.

### Ré-épinglages du pli (dans `ef435397`)

- `/openapi.json` : `ca605b3b…` → **`de635be9…7ba1`** (seul ajout : `responses["413"]` des quatre opérations).
- `PENDING_BODIES_SHA256["/openapi.json"]` (`test/harness-served.test.ts:664`) : `ca605b3b…` → `de635be9…`. Les trois autres corps ne bougent pas.
- `node scripts/sync-harness-served.mjs --pending` : `harness-pending.json`, **seuls `written_at`** (`2026-10-05T16:20:15.411Z` → `2026-10-05T16:40:00.262Z`) **et `openapi_sha256`** (`de635be9…`) changent ; `pending_since` gardé, `harness-served.json` inchangé (`30afbec2…`). Aucun champ partagé de l'instantané ne bouge (la liste des statuts n'y est pas écrite). Entrée du manifeste du site et `PINNED` (`:51`) : `38d8b71f…` → **`cee3c6a02716e376a583b093cfeec9451a19d07ef56f7da49d348caac4ecf91e`**.
- `node scripts/sync-ukemi-served.mjs --pending` lancé puis **annulé** : seul `written_at` bougeait ; `ukemi-pending.json` reste `220c14c9…`.

### Tests et tueurs du pli

| Test | Tueur | Tiré |
|---|---|---|
| `every_status_of_a_described_operation_is_listed_by_openapi` (neuf, `server.test.ts`) : sur le fil, `POST /calibrate` reçoit 200, 400, 403, 413 et 500, et cette liste est exactement celle de `/openapi.json`, la même pour les quatre opérations | `apps/harness/src/openapi.ts:91 SDL "\"413\": {" -> ""` | tué (red-proof et à la main) |
| `internal_500_branches_fail_closed_unless_exclusive` (neuf, `openapi.test.ts`) : quatre `InternalError` non exclusifs refusés | `apps/harness/src/schema-projection.ts:132 CONST "internal[\"additionalProperties\"] !== false" -> "false"` | tué (red-proof et à la main) ; seconde moitié tirée à la main : `:133` condition `operation` → `false`, tué |
| `transport_500_branch_takes_a_closed_list_of_keys` (neuf, `openapi.test.ts`) : `InternalError` étendu de `minProperties` et `allOf`, branche de transport attendue à l'identique | `apps/harness/src/schema-projection.ts:136 CONST "...picked" -> "...internal"` | tué (red-proof et à la main) |
| `every_500_of_the_server_validates_the_published_500_schema` (ré-ancrage seul : la ligne du `oneOf` a bougé) | `apps/harness/src/schema-projection.ts:137 CONST "[internal, transport]" -> "[internal]"` | tué (à la main ; non jugé par red-proof, seule la ligne du tueur change) |

Les deux tests d'`openapi.test.ts` lisent `internal500Schema` par un import d'espace de noms : à `07d560d2`, le fichier se charge et rougit par assertion.

### red-proof, ancres, R-25 et contrôles du pli

- `node scripts/red-proof.mjs --base 07d560d2 --gel ef435397 --repo . --draw 4 --seed 37` : **sortie 0, 3 jugés, 27 inchangés, 3 F2P, 3 tueurs tirés, 3 tués** ; `RED-PROOF.json` sha256 `c0e5b925f9a7…`. Aucun test refusé.
- `verifie-ancres.mjs . --touched origin/base/chantier-moteur-2026-10-03 HEAD` : **20 tueurs, 20 ancrés, 0 dérivé, 0 perdu**.
- R-25 contre `bc8deef3` : **STAT 167** (+155 / −12) ≤ 547 ; CONTENT_STAT 0.
- Contrôles (arbre de `ef435397`) : `npm test` complet **2 551 tests, 2 529 verts, 0 rouge, 22 sautés, 0 annulé, exit 0** ; `tsc` 0 ; `eslint .` 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK (346 fichiers) ; `lang:gate` OK ; `export:check` OK ; build du site vert et `assert-fleet-html` OK (quatre assertions).

### Reportés (items)

- **N-3** : `TRANSPORT_500.properties.error` est le même objet que celui d'`InternalError` (surface partagée de N-5 de C', un nœud de plus). À traiter avec N-5 (`structuredClone` ou gel profond).
- **N-5** : `every_500_…` et `every_status_…` remplacent `run` du descripteur partagé (restauré dans `finally`) ; ils casseront le jour où N-5 de C' gèlera les descripteurs. À ce moment, injecter l'outil autrement.
- **N-6** (antérieurs au lot, changement de serveur) : (a) un `Host` illisible reçoit un 500 de transport au lieu d'un 400 ; (b) `Readable.fromWeb(…).pipe(res)` (`server.ts:168`) sans écouteur `error` : une erreur de flux n'est pas attrapée ; (c) si `res.headersSent`, le `catch` ajoute le corps de transport à un corps commencé. Item proposé : **HARNESS-TRANSPORT-CATCH-1**.
- **N-7** : un générateur de clients qui ignore `additionalProperties: false` peut voir deux correspondances du `oneOf` (aucun discriminant possible) ; à signaler dans la NOTICE si des intégrateurs génèrent des clients.
- **N-8** : jargon de revue dans les commentaires de tests exportés (`server.test.ts`, précédent établi) ; à un futur lot de toilette d'export.
