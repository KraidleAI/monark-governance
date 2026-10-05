# G0 du lot SCHEMA-PROJECTION-FAIL-CLOSED-1 (contrat 1.1.0) : `inlineDefs` échoue fermé

- **Item** : SCHEMA-PROJECTION-FAIL-CLOSED-1 (`docs/ETAT.md` de `lot/etude-suite`) : « `inlineDefs` perd les mots-clés voisins d'un `$ref` et boucle sur une définition récursive ; la projection doit échouer fermé. » Né de N-2 de la G2 de C' 3c-4a. La partie `500` (exclusion des branches, liste fermée de clés) est déjà pliée par TRANSPORT-500-SCHEMA-1 (N-1, N-2 de sa G2) ; reste le cœur : `inlineDefs`.
- **Base** : `base/chantier-moteur-2026-10-03` à `7ad0f580` (refspec explicite). Branche `recherches/schema-projection-fail-closed-1`, aucune PR.
- **Statut** : G0 court, écrit avant les tests rouges et le gel. Auteur : RECHERCHES.

## 1. Périmètre

`apps/harness/src/schema-projection.ts:108-116`, la fonction `inlineDefs` (privée), qui projette les corps d'erreur du miroir depuis `schemas/tool-error.schema.json` : `TOOL_ERROR_400_SCHEMA` (`:120`, la racine) et `TOOL_ERROR_500_SCHEMA` (`:140`, `$defs/InternalError`). Seul appelant : ces deux constantes, calculées au chargement du module ; elles sont publiées par `/openapi.json` (`openapi.ts`).

Hors périmètre : `stripMeta` (inchangé ; il retire `description`/`title` avant l'inlining, voir Q-SPF-5) ; `derefVerdict` (remplacement du `$ref` externe de `GateDecision.verdict`, autre mécanisme, voir Q-SPF-6) ; le fichier gelé et le paquet gelé.

## 2. Comportement mesuré à la base

Script de mesure (hors arbre, dans le dossier de travail de la session) : il extrait le texte de `asObject` et `inlineDefs` du fichier de la base, sans le modifier, et les appelle sur des entrées synthétiques. Node 24.21.0, 0,12 s.

| Entrée | Résultat à `7ad0f580` |
|---|---|
| `{ $ref: "#/$defs/Operation", maxLength: 64 }` | `{"type":"string","minLength":1}` : **`maxLength` perdu en silence** |
| la même chose sous `properties.op`, voisin `enum: ["gate"]` | **`enum` perdu en silence** |
| `Node` dont `properties.next` est `{ $ref: "#/$defs/Node" }` | **`RangeError: Maximum call stack size exceeded`** (récursion jusqu'au débordement de pile) |
| `A -> B -> A` (mutuelle) | **`RangeError`** idem |
| `#/$defs/Missing` | lève, message sans rapport : « expected an object at #/$defs/Missing » |
| `"Operation"` (nom nu, pas un pointeur local) | **résolu en silence** vers `$defs/Operation` |
| `other.schema.json#/$defs/Operation`, `#/properties/x`, `#/$defs/constructor` | lève « expected an object at … » |
| `{ $ref: 42 }` | **gardé tel quel** (`{"$ref":42}`), une référence non résolue passerait dans le document |
| `Operation` utilisé deux fois côte à côte (témoin) | inliné deux fois (correct) |

Le fichier gelé actuel n'a ni voisin de `$ref`, ni récursion, ni référence non locale : les octets servis sont justes aujourd'hui ; le défaut est latent (un fichier gelé futur, ou une `$defs` ajoutée en 1.2, serait projeté faux sans alerte, ou ferait tomber le serveur au chargement sur un `RangeError`).

Empreintes à la base (mesurées en processus, `handleJsonMirror`) : `/openapi.json` **`61c9df97a254a863a68fdc2c493799803397bfa190b85db3ca97673d2a8ccbf0`** (égale à `PENDING_BODIES_SHA256` et à `harness-pending.json`) ; `JSON.stringify(TOOL_ERROR_400_SCHEMA)` `75dc6b17…0408` ; `JSON.stringify(TOOL_ERROR_500_SCHEMA)` `072a23ce…6ae0`.

## 3. Construction

`inlineDefs(node, defs, via = [])` devient exportée (pour les tests) et délègue chaque nœud qui porte une clé `$ref` à `defOfRef(node, defs, via)`, qui rend le nom de la définition ou **lève** :

1. `$ref` qui n'est pas une chaîne `#/$defs/<nom>` d'une définition propre de `defs` (`Object.hasOwn`), nom non vide, sans `/`, `~`, `%` (pointeur plus profond, nom échappé) : « does not name a known local definition (#/$defs/<name>) » ;
2. définition qui n'est pas un objet : `asObject` (comme à la base) ;
3. `$ref` avec des mots-clés voisins (après `stripMeta`) : « has sibling keywords (…) that inlining would drop » ;
4. définition déjà sur son propre chemin d'inlining (`via`) : « is recursive (A -> B -> A); it cannot be inlined ». `via` est le chemin, pas l'ensemble des définitions vues : une définition utilisée deux fois côte à côte (`Operation`, quatre fois dans le fichier gelé) n'est pas récursive.

Comme les deux constantes sont calculées au chargement, un fichier gelé fautif fait échouer le chargement du module (donc l'amorçage du serveur et toute la suite de tests) avec un message clair. Pour une entrée valide, le chemin de projection est le même qu'à la base (mêmes clés, même ordre) : **aucun octet servi ne bouge**.

`defOfRef` est une déclaration de fonction placée en fin de fichier (hissée au chargement) et `inlineDefs` garde ses 9 lignes : aucune ligne visée par un tueur existant ne bouge (`schema-projection.ts:132`, `:136`, `:137`, `:266`, visées par `openapi.test.ts`, `server.test.ts`, `error-code.test.ts`), donc aucun ré-ancrage (Q-SPF-3).

## 4. Tests rouges (`apps/harness/test/openapi.test.ts`, préfixe `spf_`)

`inlineDefs` est lue par l'import d'espace de noms déjà présent (`projection`) : un arbre sans l'export charge le fichier et rougit par assertion. Le commit des tests rouges porte aussi le seul mot `export` devant `inlineDefs` (sans effet sur le comportement, Q-SPF-4) : à ce commit, chaque test rougit pour la raison mesurée.

| Test | Rouge à la base (avec l'export) | Tueur prévu |
|---|---|---|
| `spf_ref_with_sibling_keywords_fails_closed` : voisins à la racine, sous `properties`, `$defs` voisin ; témoin : un `$ref` nu s'inline | « Missing expected exception: root » (voisins perdus) | `schema-projection.ts:493 CONST "siblings.length > 0" -> "false"` |
| `spf_recursive_definition_fails_closed` : récursion directe et mutuelle, chemin nommé ; témoin : une chaîne `A -> B -> Operation` utilisée deux fois côte à côte | `actual: RangeError: Maximum call stack size exceeded` | `schema-projection.ts:494 CONST "via.includes(name)" -> "false"` |
| `spf_unknown_or_nonlocal_ref_fails_closed` : `Missing`, `constructor`, nom nu, autre document, pointeur plus profond, `#/properties/x`, nom échappé, `#/$defs/`, `42`, `null` ; définition booléenne refusée | « "#/$defs/Missing": refused », `actual: … expected an object at #/$defs/Missing` | `schema-projection.ts:490 CONST "!Object.hasOwn(defs, name)" -> "false"` |

Les trois rougeoient par `ERR_ASSERTION` (aucun blocage : le `RangeError` est attrapé par `assert.throws` et comparé au motif). Le test existant `openapi_400_and_500_are_the_tool_error_projections` (projection indépendante du fichier gelé) et l'épingle `pending_bodies_are_pinned_byte_for_byte` gardent la non-régression des octets.

## 5. Tueurs

Chaque tueur ci-dessus est tiré à la main au gel (édition, ce seul test, rouge, restauration, sha256 du fichier égal à l'original), puis tiré par `red-proof` (`--draw 3 --seed 37`, base = ce commit G0). Le tueur de la récursion fait déborder la pile : le test rougit par `assert.throws` (motif non tenu), en quelques millisecondes.

## 6. R-25

Estimation : **~70 lignes** (code ~+20/−7, tests ~+45, hors `docs/`), plafond 547.

## 7. Windows

Tests purement en mémoire : aucun chemin, aucun fichier, aucun processus, aucun saut. Le code ne touche à aucun chemin (`SCHEMAS_DIR` inchangé). Aucun nom réservé.

## 8. Questions (défaut entre parenthèses)

- **Q-SPF-1.** Une propriété littéralement nommée `$ref` dans une table de sous-schémas (`properties`…) est lue comme une référence (inliner non positionnel, comme à la base). (Elle échoue désormais fermé au lieu d'être mal projetée ; un inliner positionnel, sur le modèle de `stripMeta`, est un résidu.)
- **Q-SPF-2.** Une propriété nommée `$defs` dans une table de sous-schémas est toujours retirée en silence (comportement de la base, hors de la lettre de l'item). (Résidu, avec Q-SPF-1.)
- **Q-SPF-3.** Place de `defOfRef`. (En fin de fichier : aucun tueur ne bouge. Variante : juste au-dessus d'`inlineDefs`, quatre tueurs ré-ancrés dans trois fichiers de test.)
- **Q-SPF-4.** Le mot `export` d'`inlineDefs` entre au commit des tests rouges. (Oui : sans effet sur le comportement, il fait rougir les tests pour la raison mesurée et non pour l'absence d'export ; `red-proof` part du commit G0 et voit l'absence d'export, rouge par assertion aussi.)
- **Q-SPF-5.** `{ $ref, description }` n'est pas refusé : `stripMeta` retire les annotations avant l'inlining (règle C-1 documentée). (Accepté : une annotation n'est pas un mot-clé de validation.)
- **Q-SPF-6.** `derefVerdict` remplace aussi un `$ref` (externe) sans regarder ses voisins. (Hors de la lettre de l'item ; résidu chiffré au G7.)
