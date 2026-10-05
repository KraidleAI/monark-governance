# G7 du lot SCHEMA-PROJECTION-FAIL-CLOSED-1 (contrat 1.1.0) : `inlineDefs` échoue fermé

- **Plan** : `docs/G0-lot-schema-projection-fail-closed-1.md` (`9b2782c8`). Item SCHEMA-PROJECTION-FAIL-CLOSED-1 (`docs/ETAT.md` de `lot/etude-suite`), N-2 de la G2 de C' 3c-4a.
- **Base** : `base/chantier-moteur-2026-10-03` à `7ad0f580` (refspec explicite).
- **Commits** (branche `recherches/schema-projection-fail-closed-1`, aucune PR) :
  - `9b2782c8` G0 ;
  - `46d5431f` tests rouges (et le seul mot `export` devant `inlineDefs`, Q-SPF-4) ;
  - **`69a7bb5b` gel** ;
  - le commit de ce G7.
- Aucun `git add -A` ; `packages/rpc-guard/bin/rpc-guard.mjs` jamais indexé. `schemas/*.json`, le paquet gelé, `apps/site/data/`, les traces : non touchés. Fichiers du lot : `apps/harness/src/schema-projection.ts`, `apps/harness/test/openapi.test.ts`, les deux documents.

## 1. Ce que le lot écrit

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
