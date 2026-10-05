# G7 du lot CM-3c-4a (contrat 1.1.0, bloc C', premier lot de la PR C') : surfaces, textes et gardes

- **Plan** : `docs/G0-lot-c-prime.md` (section 1.1, postes 1 à 8 ; sections 4, 5, 9). Réponses de MONARK : `recherches:coordination/messages/2026-10-05-MONARK-vers-RECHERCHES-155-G0-c-prime.md` (branche `claude/monark-repository-access-brln3a`) : tous les défauts acceptés ; Q-CP-2 une PR, deux lots, 3c-4a d'abord ; Q-CP-3 `how-copy.ts` à l'octet, `docs-gate.ts` en minuscule initiale sans point ; Q-CP-4 la garde bloque `export-public --out` et `release-public.mjs`, échec fermé, aucun drapeau ; Q-CP-5 pas de garde de redéploiement de l'hôte en C' (HOST-REDEPLOY-GUARD-1 formé par MONARK). Textes des gloses et « the gate » : `…-rattrapage.md` (Q-3c-1, Q-3c-2), ligne (10) de l'ADR-CM (`0fcc18f2`).
- **Base** : précondition P-1 tenue, la PR d'intégration #161 est fusionnée (`960788cc`). La branche `recherches/c-prime-site` (G0 `8f554390`) l'a reçue par le commit de fusion **`37d66ca9`** (sans rebase) : **base de mesure du lot**.
- **Commits** (branche `recherches/c-prime-site`, aucune PR) :
  - `37d66ca9` fusion de la base ;
  - `a89f26f9` tests (rouges à la base) ;
  - `faee232e` garde d'envoi du site ;
  - `472c334b` trois gloses ;
  - `b4474bae` « the gate » et corps 400 avec `code` ;
  - **`387e32c7` gel** : OPENAPI-ERROR-CODE-1 et ses ré-épinglages ;
  - `556df176` et `8e5c1ed9` : lignes de tueurs seules (ré-ancrage, voir « Ancres ») ;
  - le commit de ce G7 (`6e0b3b5e`) ;
  - pli du G2 : `83944897` (tests, R-1 et N-7), puis le commit de cette mise à jour du G7.
- Aucun `git add -A` ; `packages/rpc-guard/bin/rpc-guard.mjs` jamais indexé. Aucun moteur touché (`packages/hikae/` inchangé), aucun fichier du paquet gelé écrit.

## Ce que le lot écrit

1. **SITE-SEND-GUARD-MECH-1** (`scripts/export-public.mjs`, `.d.mts`). `pendingSendBlockers(kept, readText)` (pure, exportée, déclarée) rend la liste des bloquants de l'ensemble gardé : `apps/site/data/harness-pending.json`, `apps/site/data/ukemi-pending.json`, et `harness-served.json` ou `ukemi-served.json` qui portent `pending_since` (un fichier servi illisible bloque : échec fermé). Dans `doExport` (mode `--out`), après les gardes existantes et **avant toute écriture** : s'il y a un bloquant, sortie 1, message qui nomme l'item, chaque fichier, et les deux sorties admises (envoyer depuis le SHA déployé ou le tronc, ou promouvoir à T0 par `sync-harness-served.mjs` puis `sync-ukemi-served.mjs`). Aucun drapeau de contournement. `--check` n'est pas gardé. `release-public.mjs` passe par `export-public.mjs --out` (étape 2, avant la synchro du miroir) : il s'arrête donc là, « RELEASE ABORTED: export failed », le clone du miroir intact (mesuré par `release_public_flow`). La ligne de RUNBOOK qui nomme la garde reste à MONARK.
2. **Trois gloses** : `apps/site/lib/how-copy.ts:73-75` porte les trois textes de MONARK à l'octet ; `apps/site/lib/docs-gate.ts:44-46` les mêmes, minuscule initiale et sans point final (Q-CP-3). `out_of_support` et `region_degenerate` inchangées.
3. **« the gate »** : `apps/harness/src/tools/gate.ts:865` rend `unsupported prediction.schema_version '<reçu>': the gate speaks '1.1.0'; specification: https://github.com/KraidleAI/monark-kata-spec`. Le commentaire C-3 (`gate.ts:271-277`) dit que `input_invalid` et `json_invalid` sont servis depuis C' ; nombre de lignes du bloc gardé.
4. **Corps 400 avec `code`** (`apps/harness/src/http.ts:90`, `:97`) : `invalid_json` gagne `message` (`the body of POST /<op> is not JSON`) et `code` `json_invalid` ; `invalid_input` gagne `message` (`the body of POST /<op> does not match its input schema`) et `code` `input_invalid`, `issues` gardé. Les deux lignes restent une ligne chacune (tueurs `http.ts:106` et `:112` inchangés). `PENDING` (`kata-path.test.ts:339`) = les 6 codes kata.
5. **OPENAPI-ERROR-CODE-1** : `apps/harness/src/schema-projection.ts` (seul lecteur des fichiers gelés, K-8) projette `schemas/tool-error.schema.json` : `stripMeta`, puis chaque `#/$defs/<nom>` remplacé par la définition, `$defs` retiré (OpenAPI résout `#` dans son propre document). `TOOL_ERROR_400_SCHEMA` (racine, trois branches) et `TOOL_ERROR_500_SCHEMA` (`InternalError`). `apps/harness/src/openapi.ts` : la réponse 400 de chaque opération porte `content.application/json.schema` = la racine projetée ; une réponse 500 neuve porte `InternalError`. Aucun code en littéral dans `openapi.ts` ni `schema-projection.ts` (cliquet C-3, condition 3).
6. **m-3** : un vecteur de plus (`nu-byo-foreign-digest`) dans `verify_harness_ca_liq_checks_red_on_overclaiming_surfaces` : le proxy réécrit la réponse du `/gate` BYO (`task_class` `byo-demo`) avec un `scores_sha256` étranger ; seul `gate_byo_call` rougit. Le test porte désormais son tueur (`verify-harness.mjs:365`).
7. **Test des 63 caractères** (C-11 condition 2) : `features_digest` de 63 hex = 400 `invalid_input`/`input_invalid` sur le miroir HTTP, 64 hex = 200 ; en MCP, `isError` sans `_meta` (le SDK refuse avant l'outil, le texte nomme le champ).

## Liste des changements servis de ce lot (pour MONARK)

Rien n'est servi avant T0 (ADR-PUBLIC-CADENCE-1 §17).
1. Message du 400 `schema_version_unsupported` : « the harness » → « the gate » (ligne (10)).
2. Corps 400 `invalid_json` et `invalid_input` : `message` et `code` ajoutés (forme de la racine de `tool-error.schema.json`).
3. `/openapi.json` : schéma des 400, réponse 500 neuve. Empreinte `70fc336a…` → **`d30e3123b0d8…0930`**.
4. Site (T0) : les trois gloses de `/how`, `/`, `/token` et `/docs`.
- **Rejeu de 111 appels, projection, bande USDe** : verts sans changement (aucun appel du rejeu n'est un 400 de schéma ni ne lit `/openapi.json`). **Aucune décision servie ne bouge.**

## Ré-épinglages (dans le commit du gel, `387e32c7`)

- `node scripts/sync-harness-served.mjs --pending` : `harness-pending.json` réécrit, seuls `written_at` et `openapi_sha256` (`d30e3123…`) changent ; `pending_since` gardé (`harness-served.json` inchangé, `30afbec2…`). Entrée du manifeste du site : `e8bf9775…` → **`d1045f398df3…5d44`** ; épingle `PINNED` de `test/harness-served.test.ts:51` idem.
- `PENDING_BODIES_SHA256["/openapi.json"]` (`test/harness-served.test.ts:664`) : `d30e3123…`. Les trois autres corps épinglés ne bougent pas.
- `node scripts/sync-ukemi-served.mjs --pending` lancé puis **annulé** : seul `written_at` bougeait, aucun champ partagé (règle 1.3 du G0) ; `ukemi-pending.json` et son entrée restent `220c14c9…`.

## Tueurs (forme fermée)

| Test | Tueur | Tiré |
|---|---|---|
| `site_send_refused_while_a_pending_snapshot_exists` (neuf) | `scripts/export-public.mjs:517 CONST "if (blockers.length)" -> "if (false)"` | tué |
| `site_send_allowed_after_promotion_and_check_unaffected` (neuf) | `scripts/export-public.mjs:277 CONST "\"apps/site/data/ukemi-pending.json\"" -> "\"apps/site/data/ukemi-pending.jsonl\""` | tué |
| `release_public_flow` (étendu : la release s'arrête à l'export) | `scripts/export-public.mjs:521 SDL "    process.exit(1);" -> ""` | tué |
| `calib_reason_glosses_are_monark_texts` (neuf) | `apps/site/lib/how-copy.ts:73 CONST "missed too often" -> "missed too oft"` | tué |
| `schema_version_refusal_names_the_spoken_version_and_the_spec_repository` (littéral « the gate ») | `apps/harness/src/tools/gate.ts:865 CONST "the gate speaks" -> "the harness speaks"` | tué |
| `http_400_bodies_validate_the_tool_error_root` (neuf) | `apps/harness/src/http.ts:97 CONST "code: \"input_invalid\", " -> ""` | tué |
| `features_digest_of_63_chars_is_input_invalid` (neuf) | `apps/harness/src/http.ts:97 CONST "\"input_invalid\"" -> "\"json_invalid\""` | tué |
| `openapi_400_and_500_are_the_tool_error_projections` (neuf) | `apps/harness/src/openapi.ts:86 CONST "TOOL_ERROR_400_SCHEMA" -> "TOOL_ERROR_500_SCHEMA"` | tué |
| `export_windows_path_guard_bites_seeded_text_file` (pli de R-1 : copie promue, refus attribué à la seule garde des chemins) | `scripts/export-public.mjs:513 SDL "    process.exit(1);" -> ""` | tué (à la main : rouge par assertion, `--out` sort 0 et écrit `EXPORT-MANIFEST.json` ; vert une fois la ligne rendue) |
| `verify_harness_ca_liq_checks_red_on_overclaiming_surfaces` (vecteur m-3) | `scripts/verify-harness.mjs:365 CONST " && digest === calibrateScoresSha256;" -> ";"` | tué (à la main) |
| `every_listed_code_has_a_served_thrower_or_is_pending` (`PENDING` = 6) | à la main : `http.ts:97` sans `code: "input_invalid", ` | tué (à la main ; son tueur déclaré, `gate.ts:927`, reste) |
| `schema_version_refusal_…` (URL, ancien tueur) | à la main : `gate.ts:865 CONST "; specification: https://github.com/KraidleAI/monark-kata-spec" -> ""` | tué (à la main) |

## red-proof

`node scripts/red-proof.mjs --base 37d66ca9 --gel 8e5c1ed9 --repo /home/user/monark-governance-cprime --draw 10 --seed 37` : sortie 1 (REFUSED, attendu) ; **10 jugés, 81 inchangés ; 8 F2P ; 8 tueurs tirés (tous ceux des tests admis), 8 tués** ; `RED-PROOF.json` sha256 `f6ea58892cf8…` (dépend des chemins). Le gel nommé est la tête des tests (`8e5c1ed9`) : les deux commits après `387e32c7` ne touchent que des lignes de tueurs.
- **F2P (8)** : les deux tests de la garde, `release_public_flow`, les gloses, « the gate », les corps 400, les 63 caractères, la projection OpenAPI.
- **Refusés (2), attendus** : test 42 (« host lock only », adaptation seule : la copie est promue avant `--out`) ; `verify_harness_ca_liq_checks_red_on_overclaiming_surfaces` (« green at base » : m-3 bouche un trou de tueur, la CA est déjà juste à la base ; tueur tiré à la main, tué).
- **Non jugé** : `every_listed_code_has_a_served_thrower_or_is_pending` (seule la constante `PENDING`, hors du corps, change) : rouge à la base, vert au gel, tueur tiré à la main.
- **Exécution réelle de `--out`** (G0 §9) : faite par `site_send_refused_while_a_pending_snapshot_exists` sur une copie entière de l'arbre : avec l'instantané, sortie 1, les quatre bloquants nommés, rien d'écrit, `--check` sortie 0 ; après promotion (`test/helpers/pending-snapshot.ts`), `--out` sortie 0 et aucun `*-pending.json` dans l'export.

## Ancres

- `verifie-ancres.mjs . --touched 37d66ca9 HEAD` : **53 tueurs, 53 ancrés, 0 dérivé, 0 perdu** (après `556df176`).
- Après le pli du G2 (`83944897`, `export-hygiene.test.ts` désormais touché) : **60 tueurs, 60 ancrés, 0 dérivé, 0 perdu**.
- Arbre entier : 1 166 tueurs, 1 157 ancrés, 0 dérivé, **9 perdus, tous déjà perdus à la base** (7 de `packages/hikae` sur `l1-split.ts`, 2 de `test/oracle-run.test.ts`). La base en avait 11 : les deux tueurs du test 42 (`export-public.mjs:427` et `:118`) étaient déjà décalés ; ré-ancrés ici (`:450`, `:121`), avec celui de `test-force-exit-report.test.ts:115` (`:76` → `:78`) que l'en-tête de la garde décalait (`8e5c1ed9`).

## Contrôles

Node 24.21.0, variables de proxy retirées pour les tests, TMPDIR propre à la session. `node_modules` local : liens relatifs vers `packages/` et `apps/` sous `@monark`, dépendances en copies à liens durs de `monark-governance-r25i/node_modules` (Turbopack refuse un `next` résolu hors de la racine). `npm ci` non lancé (pas de réseau) : les commandes de CI sont rejouées après lui.

| Contrôle | Commande | Résultat |
|---|---|---|
| `npm test` complet (arbre de `387e32c7`, plus le ré-ancrage de `556df176`) | `npm test` | **2 540 tests, 2 518 verts, 0 rouge, 22 sautés, 0 annulé, exit 0** (test 42 compris) |
| `tsc` | `npx tsc --noEmit` | 0 erreur |
| `lint` | `npx eslint .` | 0 erreur |
| `lint:ratchet` | `npm run lint:ratchet` | 69/69 |
| `gate:vocab` | `npm run gate:vocab` | OK (346 fichiers) |
| `lang:gate` | `npm run lang:gate` | OK |
| `export:check` | `npm run export:check` | OK (vert avec l'instantané présent) |
| CI `g3-site` | `npm run build -w @monark/site` puis `node scripts/assert-fleet-html.mjs` | build vert ; trois assertions OK |
| CI `g3-export` | `npm run test:export` | exit 0 : test 42 vert (1/1 ; export, `npm ci` et `npm run ci` du miroir) |
| CI `g3-verification` | `npm run gate:vocab && npm run typecheck && npm run test:main` | exit 0 : vocabulaire OK, `tsc` 0, `test:main` **2 539 tests, 2 517 verts, 0 rouge, 22 sautés** |
| CI `g4-architecture` | `npm run lint && npm run lint:ratchet` | exit 0 : `eslint` 0, cliquet 69/69 |

Après le pli du G2 (`83944897`) : `node --test test/export-*.test.ts test/release-public-flow.test.ts test/site-send-guard.test.ts` **11/11 verts** ; `tsc` 0 ; `eslint` 0 ; cliquet 69/69 ; `gate:vocab` OK (346 fichiers) ; `lang:gate` OK. `npm test` complet non relancé (seuls deux fichiers de test changent). Le test d'`export-hygiene` modifié n'est pas F2P au sens de `red-proof` (il est vert à la base : il bouche un trou de tueur ouvert par la garde, comme m-3) ; son tueur est tiré à la main.

## R-25

`r25()` de `scripts/oracle/r25.mjs` contre `37d66ca9` (base fusionnée), à `8e5c1ed9` : **STAT 332** (+305 / −27, dont 6 lignes des trois ré-ancrages de tueurs) ≤ 547 ; CONTENT_STAT 6 (les gloses de `/docs`). Estimation du G0 : ~200. L'écart (~+130) est dans les tests (garde : copie entière et cas purs, ~60 ; corps 400 et 500 contre le schéma, ~45 ; projection OpenAPI indépendante, ~35), et dans l'aide `pending-snapshot.ts` et l'adaptation de `release_public_flow`. Il restait 215 de marge pour le lot ; pour la PR C' (≤ 1 205), 3c-4b disposait de 873 contre ~470 estimés.
- **Après le pli du G2** (`83944897`) : **STAT 344** (+317 / −27) ≤ 547, CONTENT_STAT 6 inchangé (+12 : R-1 et N-7). Marge du lot : **203** ; 3c-4b dispose de **861** pour la PR C'.

## Écarts au G0

1. **`scripts/sync-harness-served.mjs:233`** (zone ouverte jusqu'à la fusion de C', P-4) : la liste exacte des réponses de `/gate` devient 200, 400, 403 et 500 ; sans cela `--pending` échoue fermé sur la réponse 500 neuve. À T0 la promotion lit l'hôte 1.1.0, qui sert la même liste.
2. **Tests qui exportent une copie de l'arbre** : le test 42 et `release_public_flow` promeuvent la copie (`test/helpers/pending-snapshot.ts` : instantanés retirés, `pending_since` retiré, manifeste du site recalculé) avant le `--out` qui doit réussir ; `release_public_flow` affirme d'abord que la release s'arrête à l'export avec l'instantané. `export-hygiene` change aussi (pli de R-1) : `export_windows_path_guard_bites_seeded_text_file` promeut sa copie par `dropPendingSnapshot` avant `--out` et affirme que la sortie ne nomme pas `SITE-SEND-GUARD-MECH-1`. Sans cela, la garde d'envoi sortait à 1 à la place de la garde des chemins Windows et masquait le mutant qui retire la sortie de celle-ci (`export-public.mjs:513`) ; le test porte désormais ce tueur.
3. **Découpe de T-1 et T-2** : `--check` vert avec l'instantané est mesuré dans T-1 (même copie) ; T-2 porte la fonction pure (un cas par bloquant, cas « illisible », cas « autres chemins »).
4. **Garde de `release-public.mjs`** : par son étape d'export, pas dans son `preflight` : les portes locales tournent d'abord (longues), puis l'export refuse, le miroir intact. Voir Q-CPA-1.
5. **Tueurs** : un seul par test (forme fermée) ; les tueurs secondaires (URL du refus, `PENDING`, m-3) sont tirés à la main ci-dessus.

## Dry-run de la release (R-2)

`release-public.mjs --dry-run` passe lui aussi par `export-public.mjs --out` (`release-public.mjs:10`, `:172-179`). De C2 à T0, il est donc bloqué comme la release : il ne refuse qu'après les portes locales complètes (`npm run ci`, ~15 min), sur « RELEASE ABORTED: export failed », le miroir intact. Conforme à Q-CP-4 (aucun drapeau), mais l'opérateur doit le savoir : **la ligne du RUNBOOK-vitrine de MONARK (Q-CPA-2) doit le dire**, avec la levée à la seule promotion de T0.

## Questions (pour MONARK) et réponses de la cellule

- **Q-CPA-1** (écart 4) : faut-il que `release-public.mjs` refuse aussi dans son `preflight`, avant les portes (quelques lignes de plus en 3c-4b ou plus tard) ? Défaut : non, le refus par l'export est fermé et le miroir n'est pas touché. **Réponse de la cellule : non pour ce lot.** Le refus en `preflight` (appel de `pendingSendBlockers` sur l'ensemble gardé, même message, la garde de l'export restant l'autorité) est formé comme suite **RELEASE-PREFLIGHT-SEND-GUARD-1**.
- **Q-CPA-2** : la ligne du RUNBOOK-vitrine qui nomme la garde mécanique (à MONARK, G0 §6) ; elle peut dire que la garde ne lève qu'à la promotion de T0. Elle doit aussi dire que `release-public --dry-run` est bloqué de C2 à T0, et seulement après les portes locales complètes (~15 min) (R-2).
- **Q-CPA-3** (écart 1) : accepter la ligne de `sync-harness-served.mjs` dans ce lot. Défaut : oui (zone ouverte, une ligne). **Réponse de la cellule : oui.**

## Pli du G2

G2 : `recherches:coordination/pieces/2026-10-04-G2-recherches/G2-c-prime-3c-4a.md`, **approuvé avec réserves**, aucun bloquant.
- **Pliés** :
  - **R-1** : `export_windows_path_guard_bites_seeded_text_file` appelle `dropPendingSnapshot(src)` sur la copie avant `--out` et affirme que la sortie ne contient pas `SITE-SEND-GUARD-MECH-1` ; tueur `export-public.mjs:513 SDL` ajouté au-dessus de `test(`, tiré à la main : rouge, puis vert une fois la ligne rendue (voir « Tueurs » et l'écart 2).
  - **R-2** : écrit ci-dessus (« Dry-run de la release ») et reporté sur Q-CPA-2.
  - **N-7** : `dropPendingSnapshot` affirme, après son passage, que `pending_since` n'est plus dans `harness-served.json` ni `ukemi-served.json`, avec un message qui nomme l'aide.
- **Reportés** : N-1 (liste close des instantanés, cliquet proposé), N-2 (formé comme **SCHEMA-PROJECTION-FAIL-CLOSED-1**), N-3 (codes non typés dans `http.ts`, au prochain passage), N-4 (formé comme **TRANSPORT-500-SCHEMA-1**), N-5 (gel profond des deux schémas), N-8 (ligne d'information de `--check`).
- **N-6** n'est pas un constat : la bande-annonce d'attribution des commits est imposée.
