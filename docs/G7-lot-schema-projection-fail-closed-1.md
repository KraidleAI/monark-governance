# G7 du lot SCHEMA-PROJECTION-FAIL-CLOSED-1 (contrat 1.1.0) : la projection des corps d'erreur et de l'`outputSchema` échoue fermé sur une liste fermée de cas

- **Plan** : `docs/G0-lot-schema-projection-fail-closed-1.md` (`9b2782c8`). Item SCHEMA-PROJECTION-FAIL-CLOSED-1 (`docs/ETAT.md` de `lot/etude-suite`), N-2 de la G2 de C' 3c-4a.
- **Base** : `base/chantier-moteur-2026-10-03` à `7ad0f580` (refspec explicite).
- **Commits** (branche `recherches/schema-projection-fail-closed-1`, aucune PR) :
  - `9b2782c8` G0 ;
  - `46d5431f` tests rouges (et le seul mot `export` devant `inlineDefs`, Q-SPF-4) ;
  - **`69a7bb5b` gel** ;
  - `c6c7e39e` ce G7 ;
  - pli de la G2 : `159916f6` (tests, rouges à `c6c7e39e`), **`d57bb596` gel du pli**, puis le commit de cette mise à jour du G7 (section 9).
- Aucun `git add -A` ; `packages/rpc-guard/bin/rpc-guard.mjs` jamais indexé. `schemas/*.json`, le paquet gelé, `apps/site/data/`, les traces : non touchés. Fichiers du lot : `apps/harness/src/schema-projection.ts`, `apps/harness/test/openapi.test.ts`, les deux documents.

## 1. Ce que le lot écrit

> Sections 1 à 8 : état au premier gel (`69a7bb5b`), numéros de ligne de ce gel. Le pli de la G2 (section 9) déplace ces lignes (`defOfRef` remonte à côté d'`inlineDefs`) et ferme les résidus de la section 8.

`apps/harness/src/schema-projection.ts` :

- `:110-116` : `inlineDefs(node, defs, via = [])`, exportée, garde ses 9 lignes ; tout nœud qui porte une clé `$ref` passe par `defOfRef`, puis la définition est inlinée avec `via` prolongé de son nom.
- `:482-496` : `defOfRef(node, defs, via)` (déclaration de fonction en fin de fichier, hissée au chargement) rend le nom de la définition ou lève :
  1. `:490` : `$ref` qui n'est pas une chaîne `#/$defs/<nom>` d'une définition propre (`Object.hasOwn`), nom non vide sans `/`, `~`, `%` : « does not name a known local definition (#/$defs/<name>) » ;
  2. `:491` : définition non objet : `asObject` (message de la base) ;
  3. `:493` : mots-clés voisins du `$ref` (après `stripMeta`) : « has sibling keywords (…) that inlining would drop » ;
  4. `:494` : définition déjà sur son propre chemin : « is recursive (A -> B -> A); it cannot be inlined ».

`TOOL_ERROR_400_SCHEMA` (`:120`) et `TOOL_ERROR_500_SCHEMA` (`:140`) étant calculées au chargement, un fichier gelé fautif fait échouer le chargement du module (amorçage du serveur, toute suite qui l'importe) avec ce message, au lieu d'une projection silencieusement fausse ou d'un `RangeError`.

Aucune ligne visée par un tueur existant ne bouge (`:132`, `:136`, `:137`, `:266`) : aucun ré-ancrage.

## 2. Mesures

Base `7ad0f580` (script hors arbre qui extrait `asObject` et `inlineDefs` du fichier de la base) : voisins `maxLength`/`enum` perdus en silence ; récursion directe et mutuelle : `RangeError: Maximum call stack size exceeded` ; nom nu `"Operation"` résolu en silence ; `{ $ref: 42 }` gardé ; référence inconnue : « expected an object at … ». Au gel, les mêmes entrées lèvent chacune le message de la section 1 (tests `spf_`).

## 3. Octets servis : inchangés

Mesurés en processus (`handleJsonMirror`) à la base et au gel, identiques :

| Corps | Base | Gel |
|---|---|---|
| `/openapi.json` | `61c9df97a254a863a68fdc2c493799803397bfa190b85db3ca97673d2a8ccbf0` | idem |
| `JSON.stringify(TOOL_ERROR_400_SCHEMA)` | `75dc6b17ff40690149dcc75fc4865fef0604e891f554617d4ffe86d774a30408` | idem |
| `JSON.stringify(TOOL_ERROR_500_SCHEMA)` | `072a23ce1be1e2a287a003710485d1e579ef5040f9d2387fac8b98ffd96b2ae0` | idem |

Épingles lancées explicitement, toutes vertes sans ré-épinglage : `pending_bodies_are_pinned_byte_for_byte` (`test/harness-served.test.ts`, `/openapi.json` `61c9df97…`, et l'égalité avec `harness-pending.json`), `describe_gate_kata_clause` (clause `022756c3…`, `gate-kata-served.test.ts`), `hdesc_served_gate_description_is_the_committed_clause` (description `dd728779…`, `gate-liq.test.ts`), `openapi.test.ts` entier ; `harness-served`, `bell-served`, `dojo-served`, `site-ukemi`, `fleet-ukemi-liq-leg` : 105 tests, 0 rouge. Aucun fichier de données servies, de trace ou d'instantané dans le diff.

## 4. Tests et tueurs (forme fermée)

| Test (`apps/harness/test/openapi.test.ts`) | Rouge à `46d5431f` | Tueur | Tiré à la main | red-proof |
|---|---|---|---|---|
| `spf_ref_with_sibling_keywords_fails_closed` | « Missing expected exception: root » | `apps/harness/src/schema-projection.ts:493 CONST "siblings.length > 0" -> "false"` | tué (« Missing expected exception: root ») | F2P, tué |
| `spf_recursive_definition_fails_closed` | `actual: RangeError: Maximum call stack size exceeded` | `apps/harness/src/schema-projection.ts:494 CONST "via.includes(name)" -> "false"` | tué (`RangeError` contre le motif) | F2P, tué |
| `spf_unknown_or_nonlocal_ref_fails_closed` | « "#/$defs/Missing": refused », `actual: … expected an object` | `apps/harness/src/schema-projection.ts:490 CONST "!Object.hasOwn(defs, name)" -> "false"` | tué (message « expected an object » contre le motif) | F2P, tué |

Chaque tueur tiré à la main : édition de la ligne, ce seul test lancé (rouge par `ERR_ASSERTION`), fichier restauré, sha256 égal à l'original (`52d74616…afae`). Chaque test porte ses témoins (un `$ref` nu s'inline ; une chaîne utilisée deux fois côte à côte s'inline) : un tueur qui refuserait tout ne passerait pas.

## 5. Oracle (Node 24.21.0, variables de proxy retirées pour les tests, TMPDIR dans le dossier de travail)

| Contrôle | Commande | Résultat |
|---|---|---|
| red-proof | `node scripts/red-proof.mjs --base 9b2782c8 --gel 69a7bb5b --repo . --draw 3 --seed 37` | **OK, sortie 0 : 3 jugés, 4 inchangés, 3 F2P, 3 tueurs tirés, 3 tués** ; `RED-PROOF.json` sha256 `0f8b188b41ad…` (dépend des chemins) |
| ancres | `verifie-ancres.mjs . --touched 7ad0f580 HEAD` | 6 tueurs, 6 ancrés, **0 dérivé, 0 perdu** ; sur `openapi`, `server`, `error-code` (les fichiers qui visent `schema-projection.ts`) : 24/24 ancrés |
| R-25 | `r25(".", ci.yml, "7ad0f580…")` | **STAT 74** (+67 / −7) ≤ 547 ; CONTENT_STAT 0 ; GREEN. Estimation du G0 : ~70 |
| `test:main` | `npm run test:main` | **2 574 tests, 2 552 verts, 0 rouge, 22 sautés, 0 annulé, exit 0** |
| `tsc` | `npx tsc --noEmit` | 0 erreur |
| `lint` | `npx eslint .` | 0 erreur |
| `lint:ratchet` | `npm run lint:ratchet` | 69/69 |
| `gate:vocab` | `npm run gate:vocab` | OK (346 fichiers) |
| `lang:gate` | `npm run lang:gate` | OK |

## 6. Écarts au G0

Aucun sur la construction ni sur les tests. Le message de la référence inconnue est écrit sans `ref` brut dans les deux derniers messages (`#/$defs/<nom>` reconstruit) : exigence du linter typé (`no-base-to-string`), sans effet sur le comportement.

## 7. Questions et défauts appliqués

- Q-SPF-3 : `defOfRef` en fin de fichier (aucun tueur ne bouge). Appliqué.
- Q-SPF-4 : `export` d'`inlineDefs` au commit des tests rouges. Appliqué ; `red-proof` part du G0 et voit l'absence d'export (rouge par assertion).
- Q-SPF-5 : `{ $ref, description }` accepté (`stripMeta` retire l'annotation avant, règle C-1). Appliqué.
- Q-SPF-1, Q-SPF-2, Q-SPF-6 : résidus ci-dessous.

## 8. Résidus (items proposés)

- **SCHEMA-PROJECTION-POSITIONAL-1** (Q-SPF-1, Q-SPF-2) : `inlineDefs` n'est pas positionnel. Une propriété nommée `$ref` dans `properties` (ou `patternProperties`…) est lue comme une référence et échoue désormais fermé (faux refus, pas de faux octet) ; une propriété nommée `$defs` y est encore retirée en silence (comportement de la base). Le fichier gelé n'en a aucune.
  - Option A (défaut) : laisser ouvert jusqu'à ce qu'un fichier gelé en porte une ; le faux refus serait visible au chargement. Prix : 0.
  - Option B : réutiliser `SUBSCHEMA_MAP_KEYWORDS` de `stripMeta` (clés d'une table = noms, récursion dans leurs valeurs seulement). Prix : ~+6 lignes de code, ~+12 de test, un tueur ; aucun octet servi.
- **DEREF-VERDICT-FAIL-CLOSED-1** (Q-SPF-6) : `derefVerdict` (`:100-106`) remplace `GateDecision.properties.verdict` sans vérifier que le nœud gelé est exactement `{ "$ref": "coverage-verdict.schema.json" }` ; un voisin ou une autre cible serait perdu en silence. Aujourd'hui le nœud est nu.
  - Option A : lever si `verdict` n'est pas exactement ce nœud. Prix : ~+2 lignes de code, ~+8 de test, un tueur ; aucun octet servi (le nœud gelé est conforme).
  - Option B : ne rien faire (le fichier gelé 1.1.0 ne bouge plus). Prix : 0.
  - Défaut : option A, au prochain lot qui touche `schema-projection.ts`.
- N-5 de C' (gel profond des constantes) reste ouvert, inchangé par ce lot.

## 9. Pli de la G2

G2 : `scratchpad/g2-spf/G2-schema-projection-fail-closed-1.md` (relecture de `c6c7e39e`), **NON BLOQUANT**, six constats. Décision de la cellule : tout replier avant T0, sans qu'aucun octet servi ne bouge. La base n'a pas bougé (`7ad0f580`). Commits : `159916f6` tests (rouges à `c6c7e39e`), **`d57bb596` gel du pli**.

### Ce que le pli change (`apps/harness/src/schema-projection.ts`, lignes de `d57bb596`)

| Constat | Changement | Lignes |
|---|---|---|
| N-1 (`const`/`enum`/`default`/`examples` réécrits) | `DATA_KEYWORDS` : leur valeur est une donnée, recopiée telle quelle (`structuredClone`) par `stripMeta` et par `inlineDefs`, jamais parcourue. `inlineDefs` devient positionnel comme `stripMeta` : dans une table de sous-schémas, les clés sont des noms (une propriété nommée `$ref`, `$defs` ou `const` est un nom, son schéma est inliné) | `:69-71`, `:85-104`, `:161-162` |
| N-2 (`$id` imbriqué, mots-clés dynamiques) | `refuseNestedId(raw, where)` (exportée) : lève sur tout `$id` hors de la racine du fichier gelé **brut**, avant `stripMeta` ; appliquée à `tool-error`, `gate-decision`, `coverage-verdict`. `inlineDefs` lève sur `$dynamicRef`, `$recursiveRef`, `$anchor`, `$dynamicAnchor`, `$recursiveAnchor` (`DYNAMIC_KEYWORDS`). `schemaNodes` : la liste des nœuds de schéma, lue de façon positionnelle | `:72-73`, `:106-124`, `:159-160`, `:180` |
| N-3 (`derefVerdict` inconditionnel) | lève si `properties` manque, si `verdict` manque ou n'est pas exactement `{ "$ref": "coverage-verdict.schema.json" }` (voisin, autre cible, autre forme), et si la CoverageVerdict dépouillée porte un `$ref`, un `$defs` ou un mot-clé dynamique. **Ferme DEREF-VERDICT-FAIL-CLOSED-1** | `:133-149` |
| N-4 (`in`, `__proto__`) | `Object.hasOwn(node, "$ref")` ; `stripMeta` pose chaque clé par `setOwn` (`Object.defineProperty`), donc une clé JSON `__proto__` reste une clé et ne devient jamais le prototype | `:75-79`, `:95`, `:98`, `:157` |
| N-5 (branche `%` non tuée) | définition propre `"a%20b"` et référence `#/$defs/a%20b` ajoutées au test de la référence inconnue | test |
| N-6 (formules trop larges) | commentaire de `defOfRef` réécrit (liste des refus, sans « never a silent projection ») ; titres du G0 (note en tête) et de ce G7 bornés aux cas listés ; résidus complétés ci-dessous | docs, `:165-169` |

`defOfRef` remonte juste sous `inlineDefs` (`:170-179`) : les lignes visées bougent de toute façon (+63 au-dessus de `:132`), donc Q-SPF-3 n'a plus d'objet. Sept commentaires de tueur ré-ancrés (commentaires seuls, aucun corps de test) : `openapi.test.ts` `:132 -> :195`, `:136 -> :199`, `:490 -> :173`, `:493 -> :176`, `:494 -> :177` ; `server.test.ts` `:137 -> :200` ; `error-code.test.ts` `:266 -> :329`.

### Octets servis : inchangés (base `7ad0f580` = `c6c7e39e` = `d57bb596`)

Mesurés en processus. La base est extraite par `git archive 7ad0f580` dans le dossier de travail. On compare `/openapi.json` et le `JSON.stringify` de **chacune des 28 constantes de schéma exportées** de `schema-projection.ts`, y compris le JSON Schema des Standard Schemas du SDK : **28/28 égales** entre la base, le premier gel et le gel du pli. Parmi elles :

| Corps | Empreinte (aux trois) |
|---|---|
| `/openapi.json` | `61c9df97a254a863a68fdc2c493799803397bfa190b85db3ca97673d2a8ccbf0` |
| corps 400 (`TOOL_ERROR_400_SCHEMA`) | `75dc6b17ff40690149dcc75fc4865fef0604e891f554617d4ffe86d774a30408` |
| corps 500 (`TOOL_ERROR_500_SCHEMA`) | `072a23ce1be1e2a287a003710485d1e579ef5040f9d2387fac8b98ffd96b2ae0` |
| `outputSchema` MCP (`TOOL_OUTPUT_SCHEMA`) | `3b7c685ee012756c911b5311b83c43dbd3d6a2bbeb76c5174dfccab461609e03` |

Épingles lancées explicitement, toutes vertes sans ré-épinglage : `pending_bodies_are_pinned_byte_for_byte`, `describe_gate_kata_clause` (clause `022756c3…`), `hdesc_served_gate_description_is_the_committed_clause` (description `dd728779…`), `openapi.test.ts`, `schema.test.ts`, `harness-served`, `bell-served`, `dojo-served`, `site-ukemi` et `fleet-ukemi-liq-leg` : **112 tests, 0 rouge**. Aucun fichier de `schemas/`, `packages/`, `apps/site/` ni aucune trace dans le diff du lot.

### Tests et tueurs du pli (`apps/harness/test/openapi.test.ts`)

| Test | Rouge à `c6c7e39e` | Tueur | Tiré à la main | red-proof |
|---|---|---|---|---|
| `spf_data_keywords_are_not_schemas` (N-1) | `actual: { const: { type: 'string', minLength: 1 } }` | `apps/harness/src/schema-projection.ts:162 CONST "DATA_KEYWORDS.has(k) ? structuredClone(v)" -> "false ? structuredClone(v)"` | tué ; seconde moitié (`stripMeta`, `:91` `DATA_KEYWORDS.has(k)` → `false`) tuée | F2P, tué |
| `spf_nested_id_fails_closed` (N-2) | `refuseNestedId` absente (assertion) | `apps/harness/src/schema-projection.ts:122 CONST "Object.hasOwn(n, \"$id\")" -> "false"` | tué | F2P, tué |
| `spf_dynamic_keywords_fail_closed` (N-2) | « Missing expected exception » (`$dynamicRef` passé tel quel) | `apps/harness/src/schema-projection.ts:160 CONST "dynamic.length > 0" -> "false"` | tué | F2P, tué |
| `spf_deref_verdict_fails_closed` (N-3) | « Missing expected exception: sibling » | `apps/harness/src/schema-projection.ts:142 CONST "!isMap(v) \|\| Object.keys(v).join() !== \"$ref\" \|\| v[\"$ref\"] !== VERDICT_REF" -> "false"` | tué ; seconde moitié (`:144`, garde de la CoverageVerdict → `false`) tuée | F2P, tué |
| `spf_proto_key_stays_own_data` (N-4) | `actual: '{"properties":{"x":{}}}'` | `apps/harness/src/schema-projection.ts:157 CONST "Object.hasOwn(node, \"$ref\")" -> "\"$ref\" in node"` | tué ; `stripMeta` `:98` et `:95` (`setOwn` → affectation) tués | F2P, tué |
| `spf_unknown_or_nonlocal_ref_fails_closed` (N-5, durci) | **vert** (le `%` était déjà refusé) | inchangé, ré-ancré `:173` | `:173` `[/~%]` → `[/~]` : **tué** (« "#/$defs/a%20b": refused ») | voir ci-dessous |

Les trois tueurs du premier gel (ré-ancrés) et les quatre tueurs ré-ancrés des tests voisins (`internal_500_branches_fail_closed_unless_exclusive`, `transport_500_branch_takes_a_closed_list_of_keys`, `every_500_of_the_server_validates_the_published_500_schema`, `no_served_request_reasons_hold`) ont été retirés à la main aux nouvelles lignes : tous tués. Chaque tir : une ligne éditée, ce seul test, rouge, restauration, sha256 du fichier égal à l'original (`7e3c48ca…8ae5`). En tout : **18 tirs à la main, 18 tués**.

### red-proof, ancres, R-25

- **Lot entier** : `node scripts/red-proof.mjs --base 9b2782c8 --gel d57bb596 --repo . --draw 8 --seed 37` : **OK, 8 jugés, 23 inchangés, 8 F2P, 8 tueurs tirés, 8 tués** ; `RED-PROOF.json` sha256 `2e2a74883e75…`.
- **Pli seul** : `--base c6c7e39e --gel d57bb596 --draw 6 --seed 37` : 5 F2P et 5 tueurs tués, mais le verdict est **REFUSED**, comme attendu : `spf_unknown_or_nonlocal_ref_fails_closed` est un durcissement, vert à `c6c7e39e` (« green at base: a self-confirming test »). Son tueur `%` est tiré à la main (tué, voir le tableau). Le verdict qui fait foi est celui du lot entier ci-dessus. `RED-PROOF.json` sha256 `d15a5530bd49…`.
- **Ancres** : `verifie-ancres.mjs . --touched 7ad0f580 HEAD` : **29 tueurs, 29 ancrés, 0 dérivé, 0 perdu** (`openapi`, `server`, `error-code`).
- **R-25** contre `7ad0f580` : **STAT 232** (+211 / −21), sous le plafond de 547 ; CONTENT_STAT 0 ; GREEN.

### Contrôles (arbre de `d57bb596`)

| Contrôle | Résultat |
|---|---|
| `npm run test:main` | **2 579 tests, 2 557 verts, 0 rouge, 22 sautés, 0 annulé, exit 0** |
| `npx tsc --noEmit` | 0 erreur |
| `npx eslint .` | 0 erreur |
| `npm run lint:ratchet` | 69/69 |
| `npm run gate:vocab` | OK (346 fichiers) |
| `npm run lang:gate` | OK |

### Résidus après le pli

- **SCHEMA-PROJECTION-POSITIONAL-1** et **DEREF-VERDICT-FAIL-CLOSED-1** (section 8) : **fermés** par N-1 et N-3.
- **DYNAMIC-ELSEWHERE-1** : les mots-clés dynamiques ne sont refusés que là où une référence est résolue, c'est-à-dire dans les corps d'erreur et dans la CoverageVerdict. Les schémas projetés par `stripMeta` seul (`Prediction`, `AttestedPrice`, les entrées MCP) les laisseraient passer jusqu'à ajv. Aucun fichier gelé n'en porte.
  - Option A (défaut) : laisser ouvert. Prix : 0.
  - Option B : refuser dans `stripMeta`. Prix : ~+2 lignes de code, ~+6 de test, un tueur ; aucun octet servi.
- **NESTED-ID-ELSEWHERE-1** : `refuseNestedId` ne s'applique qu'aux trois fichiers qui portent ou reçoivent une référence. `prediction` et `attested-price` n'ont pas de `$ref` : un `$id` imbriqué y serait retiré par `stripMeta` sans effet de résolution.
  - Option A (défaut) : laisser ouvert. Prix : 0.
  - Option B : l'appliquer dans `loadFrozen`. Prix : 1 ligne de code, ~+4 de test.
- **DEFINITIONS-KEYWORD-1** : `inlineDefs` ne retire que `$defs`. Un bloc `definitions` (draft-07) resterait dans le document OpenAPI comme une table inerte, et ses références `#/definitions/x` sont refusées (fermé).
  - Option A (défaut) : laisser ouvert. Prix : 0.
  - Option B : refuser `definitions` dans `inlineDefs`. Prix : 1 ligne de code, ~+3 de test.
- **UNKNOWN-KEYWORD-OBJECTS-1** : la valeur objet d'un mot-clé inconnu (hors données et hors tables) est lue comme un schéma : on y inline, on y retire les annotations. C'est le comportement de la base. Le fichier gelé n'en a pas.
  - Option A (défaut) : laisser ouvert. Prix : 0.
  - Option B : liste fermée des mots-clés de schéma 2020-12, avec refus de tout mot-clé inconnu. Prix : ~+10 lignes de code, ~+10 de test. **Risque** : un fichier gelé futur qui porterait un mot-clé d'annotation propre serait refusé.
- N-5 de C' (gel profond des constantes) : reste ouvert. Les copies `structuredClone` des données réduisent le partage, sans le supprimer.
