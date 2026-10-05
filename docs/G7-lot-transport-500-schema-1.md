# G7 du lot TRANSPORT-500-SCHEMA-1 (contrat 1.1.0) : le 500 publié par `/openapi.json` dit tout ce que le serveur envoie

- **Plan** : `docs/G0-lot-transport-500-schema-1.md` (`f61c9143`). Item TRANSPORT-500-SCHEMA-1 (`docs/ETAT.md` de `lot/etude-suite`), N-4 de la G2 de C' 3c-4a (`recherches:coordination/pieces/2026-10-04-G2-recherches/G2-c-prime-3c-4a.md`). Déclencheur : avant la NOTICE de T−7.
- **Base** : `base/chantier-moteur-2026-10-03` à `bc8deef3` (3c-4a #164 et 3c-4b #167 fusionnés).
- **Commits** (branche `recherches/transport-500-schema-1`, aucune PR) :
  - `f61c9143` G0 ;
  - `d233de2d` tests (rouges à la base) ;
  - **`8faf19fa` gel** : code et ré-épinglages ;
  - le commit de ce G7.
- Aucun `git add -A` ; `packages/rpc-guard/bin/rpc-guard.mjs` jamais indexé. `schemas/*.json` et le paquet gelé non touchés. `apps/harness/src/server.ts` et `http.ts` non touchés : aucun corps servi ne change.

## Ce que le lot écrit

1. **Construction** (G0 §2, option 2) : `apps/harness/src/schema-projection.ts:119-129`. `TOOL_ERROR_500_SCHEMA` devient `{ oneOf: [INTERNAL_500, TRANSPORT_500] }` :
   - `INTERNAL_500` : la projection de `$defs/InternalError`, inchangée (500 d'une opération : `output_invalid`, ou levée de l'outil ; `operation` requise) ;
   - `TRANSPORT_500` : `InternalError` restreint à sa seule propriété `error` (`type` et `additionalProperties: false` repris de la définition gelée, `required: ["error"]`, `properties.error` lu dans la définition gelée, échec fermé par `asObject` s'il manque). C'est exactement `{"error":"internal_error"}`, le corps que `server.ts:174` envoie et que la description gelée nomme (« a transport-level 500 without operation »).
   Les deux branches s'excluent (`operation` requise d'un côté, interdite de l'autre). Aucun code en littéral (cliquet C-3), aucun `$ref` dans le document.
2. **Description du 500** (`apps/harness/src/openapi.ts:92`) : « The tool output broke its frozen contract, or the tool failed (both name the operation); or the request failed in transport (no operation); never a stack. »

**Pourquoi pas l'option 1** (donner une `operation` au 500 de transport) : la description du schéma gelé publie ce 500 comme un corps sans `operation`. Le serveur aurait cessé d'envoyer ce que le contrat gelé annonce, et une `operation` aurait dû être inventée là où il n'y en a pas (surface MCP, `Host` illisible avant le routage, chemin vide face à `minLength: 1`). L'option 2 laisse le serveur et le fichier gelé vrais, et rend OpenAPI vrai.

## Liste des changements servis de ce lot (pour MONARK)

Rien n'est servi avant T0. Seul `/openapi.json` change (schéma et description du `500` des quatre opérations) : empreinte `ccae5fc0…844f` → **`ca605b3b0feb319d6b39bd601684dda0e61029e658feb6cec215691a3599c3f6`**. Aucun corps de réponse d'opération, aucune décision, aucune trace ne bouge.

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

- **Q-T500-1** : le `413` (`payload_too_large`) que `POST /{op}` peut recevoir n'est pas listé par `/openapi.json`. Ce n'est pas une contradiction (une absence ; le fichier gelé le dit non décrit), mais un client qui lit OpenAPI ne l'apprend pas. Défaut : rien avant T0 ; le lister (sans schéma, comme le `403`) changerait encore l'empreinte d'OpenAPI.
- **Q-T500-2** : le fichier gelé décrit le 500 de transport en prose seulement ; la branche `TRANSPORT_500` est dérivée d'`InternalError` (restriction à `error`), pas lue d'une définition gelée. À la prochaine version du contrat, une `$defs/TransportError` gelée rendrait la projection directe. Défaut : noter pour la version suivante.
- N-2 (SCHEMA-PROJECTION-FAIL-CLOSED-1) et N-5 (gel profond des constantes) restent ouverts ; ce lot ne les aggrave pas (la branche neuve n'a ni `$ref` ni voisin de `$ref`).
