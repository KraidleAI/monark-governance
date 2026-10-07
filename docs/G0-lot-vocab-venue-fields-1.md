# G0 du lot VOCAB-VENUE-FIELDS-1 : la venue épinglée de la vague 1 masquée dans les colonnes d'une ligne de table

RECHERCHES, 2026-10-07. Base `177b5755` (lot/etude-suite). Constat de MONARK, décision de RECHERCHES `76ffa25`.

Auteur : RECHERCHES ; rédaction initiale et pli de la G2 (MONARK, `2026-10-07-MONARK-vers-RECHERCHES-g2-221-222.md`, pièce
`g2-221-222.json` clé `0`) par un worker `claude-opus-5-5`, à l'effort de la session, sans réglage explicite (RECHERCHES,
`2026-10-07-RECHERCHES-vers-MONARK-pr226-close-erratum-21.md`), horloge du pli lue à 09:05 UTC. Le pli est construit sur le tronc
`1cddd2e5` (après #228), fusionné dans la branche. Pli du delta G2 (MONARK `e7234bd`,
`2026-10-07-MONARK-vers-RECHERCHES-tronc-rh1-g2-221-222.md`, pièce `g2-221-222-delta.json` clé `0`) par un worker `claude-opus-5-5`,
effort `max` passé par l'orchestrateur de RECHERCHES, horloge lue à 10:34 UTC ; le tronc `591b3a30` est fusionné dans la branche.

## Constat (mesuré à la base)

- `scripts/spec-publish.mjs` ne masque la venue que dans le segment de venue d'une clé `kata:…@<venue>/…` (l.95, l.113).
- Chaque ligne réelle porte aussi la venue dans la colonne `venue` et dans `source.trial_id`
  (`apps/harness/src/policy-projection.ts` l.100, l.117), nom refusé par la portée site de `vocab-banned.json` (l.55).
- Rejeu hors dépôt de `recherches:kata/registry/wave1.json` (`811fcd57…d9cb`) : 280 cases, 32 tables projetées par `projectCell`
  et `buildPolicyTable`, classes des tables servies ; `contentProblems` rend **592** problèmes `vocabulary`, sur les 32 tables.

## Décision appliquée

Masquage par champ **lié à la valeur épinglée**, jamais une exemption par nom de champ :

- l'épingle `waveVenue()` : la seule venue des 280 cases du registre `811fcd57` (aucune épingle n'existait : le masquage de clé
  accepte toute venue de la grammaire) ;
- masqués : la colonne `venue` et le troisième segment d'un `source.trial_id` à six segments, d'une ligne d'une table d'un fichier
  `policy-table` ou du fichier de vecteurs, et seulement quand la valeur est l'épingle ;
- passe décodée : sur une copie masquée de la valeur lue ; passe octets : seulement un texte qui est une écriture stable de la valeur
  lue (`canonicalJson`, ou `JSON.stringify` compact ou indenté de 2, avec ou sans LF final), réécrit masqué sous la même forme ; tout
  autre texte reste tel quel et la passe octets le juge en entier ;
- restent refusés : une autre valeur dans ces champs (casse comprise), le nom écrit en clair dans tout autre champ, en texte libre, hors
  table ; un texte qui n'est pas une écriture stable ne masque rien, et la passe octets le juge tel quel. Limite héritée de la porte,
  base comprise : un membre échappé puis effacé par une clé dupliquée échappe aux deux passes, quel que soit le mot (item ci-dessous).

Pli de la G2 (constat M) : la première passe octets masquait par comptage (autant de motifs dans le texte que de champs masqués dans la
valeur lue). Un membre de ligne échappé comptait dans la valeur sans correspondre au motif et « payait » un membre égaré hors table, que
`JSON.parse` efface par une clé dupliquée : un `vectors-1.1.0.json` façonné était publié avec le nom hors des deux champs. La réécriture
stable supprime le comptage et l'interpolation du pin dans une RegExp ; elle tient dans les mêmes huit lignes (l.355-362). Les
commentaires l.93-94 (liste fermée des exceptions), l.103-104 (`vocabularyHits` reçoit le texte masqué) et l.332-333 sont réécrits en
place.

L'épingle est liée aux octets : `apps/harness/data/kata/registry/wave1.json` est dans le dépôt depuis #228 ; le test 1 en vérifie le
sha256 (`811fcd57…`), le nombre de cases (280) et l'ensemble des venues (`{pin}`). La limite « lien seulement documentaire » est close
sans item.

Deux réécritures en place (l.137, l.147), le reste en déclarations de fonction ajoutées en fin de fichier : aucun tueur ne bouge.

## Pli du delta G2 (MONARK `e7234bd` : quatre m)

1. Texte seulement : la réserve des l.31-33 remplace l'affirmation que tout texte instable est refusé. Le corps de la PR, le commentaire
   `scripts/spec-publish.mjs:331` et l'en-tête du test (l.4) disent « le nom écrit en clair » ; l.331 et l.4 sont réécrites en place,
   aucun tueur n'y est ancré. Le corps ne nomme pas l'item.
2. Tests seulement, aucune ligne de production : trois mutations des lignes neuves survivaient à tous les tests.
   - X5 (`:357`, `catch { return text; }` → `""`) : test 8, le nom en texte libre d'un fichier markdown (la venue épinglée, et
     « RECHERCHES ») est refusé ; tueur `:357` au-dessus du test.
   - X1 (`:358`, forme compacte retirée) : au test 6, une écriture compacte + LF à clés non triées rend `[]` ; tueur `:358` dans le corps.
   - X6 (`:360`, `try` retiré) : au test 6, un membre à surrogate isolé, écrit compact + LF, rend `[]` sans lever (l'écriture canonique
     lève `not_canonical`, la compacte est essayée ensuite) ; tueur `:360` dans le corps.
   - X10 (SDL de `:359`) est équivalent : sans champ masqué, `m.value` est une copie égale à `v`, et une écriture égale au texte le rend.
3. Le BOM de tête est ôté avant le contrôle canonique (l.135, présent à la base) : noté, corrigé en lot à part (item ci-dessous), rien
   ici.
4. Titres : ceux de `464add3e` (« Merge lot/etude-suite into vocab-venue-fields-1 ») et de `9b7bdc62` (« Record the post-review
   evidence in the lot notes ») échouent à `prbody` sur « lot ». Décision de MONARK : erratum, sans réécriture d'historique, comme pour
   `47002407`. Les titres de ce pli sont en anglais simple, la fusion du tronc comprise (« Merge the trunk »).

## Items formés (décision de MONARK `e7234bd`)

Un seul petit lot de durcissement de la porte, porteur RECHERCHES (code), G2 MONARK. Déclencheur : avant la première publication réelle
par `spec-publish` (release L ou c, la première venue). Ce lot ne passe pas par 3a, déjà à son repli. Rien n'en est fait dans cette PR.

- VOCAB-JSON-DUPKEY-1 : refuser toute clé dupliquée dans les textes JSON des kinds `json` et `schema` (le kind `policy-table` l'est déjà
  par `not_canonical`) ; ferme la limite héritée des l.31-33. Mesuré par MONARK : 0 doublon sur 42 entrées réelles.
- SPEC-BOM-CANONICAL-1 : l.135, `{ fatal: true }` → `{ fatal: true, ignoreBOM: true }`. Le BOM reste alors dans le texte : refus `[cf]`
  (vocabulary), et `json_invalid` pour les kinds JSON. Aujourd'hui, une table précédée de EF BB BF est publiée avec un sha256 qui n'est
  pas celui de son écriture canonique. Mesuré par MONARK : aucune suite ne change, 0 BOM de tête sur 46 entrées.

## Tests (`test/spec-venue-fields.test.ts`, lignes réelles de forme : registre synthétique semé)

1. venue épinglée dans `venue` et `trial_id` : acceptée (fichier de table, et table du fichier de vecteurs écrite avec espaces) ;
2. autre valeur dans `venue` ou `trial_id` : refusée par les deux passes ;
3. nom hors des deux champs, ou table hors des deux portées, ou membre répété ou échappé, ou les trois fichiers de vecteurs façonnés
   de la G2 (P1 : `venue` échappé et membre égaré effacé par doublon ; P1b : la même chose sur `trial_id` ; P5 : `trial_id` répété) :
   refusé ;
4. rejeu des 32 tables du registre synthétique : 0 problème `vocabulary` ;
5. passe décodée liée à la même épingle ;
6. passe octets : les écritures stables (canonique, compacte + LF) passent, une compacte + LF à clés non triées aussi, et un membre à
   surrogate isolé n'y lève pas ; P1, P1b et P5 sont refusés par la passe octets ;
7. une table de forme réelle sans `recompute` n'a aucun problème, tous codes confondus (compose `contentProblems` et le masquage) ;
8. le nom en texte libre d'un fichier markdown, la venue épinglée comme « RECHERCHES », est refusé : aucun masquage hors JSON.

## Tueurs

- scripts/spec-publish.mjs:346 CONST "row.venue === pin" -> "row.venue === \"KEY\""
- scripts/spec-publish.mjs:348 CONST "t[2] === pin" -> "t[2] !== \"\""
- scripts/spec-publish.mjs:344 SDL (la ligne de portée)
- scripts/spec-publish.mjs:137 CONST "vocabularyHits(venueMaskedText(text, out, kind))" -> "vocabularyHits(text)"
- scripts/spec-publish.mjs:147 CONST "strings(venueMasked(v, out, kind).value)" -> "strings(v)"
- scripts/spec-publish.mjs:360 CONST "w(v) + end === text" -> "true"
- scripts/spec-publish.mjs:343 CONST "structuredClone(v)" -> "v"
- scripts/spec-publish.mjs:357 CONST "catch { return text; }" -> "catch { return \"\"; }"
- dans le corps du test 6, deux lignes :
  - scripts/spec-publish.mjs:358 CONST "(x) => JSON.stringify(x), " -> ""
  - scripts/spec-publish.mjs:360 CONST "try { if (w(v) + end === text) return w(m.value) + end; } catch { /* not this writing */ }" -> "if (w(v) + end === text) return w(m.value) + end;"

## Preuves

- Rejeu réel (`811fcd57…`, hors dépôt, script en dossier de travail) : 32 tables, 280 lignes, **0** problème `vocabulary` (592 à la
  base) ; restent, inchangés, `recompute_held` (attestation synthétique du rejeu) et `short_digest` sur les quatre dir-4h.
- red-proof `--base 177b5755 --draw 5 --seed 1` : 5 tests F2P, 5 tueurs tués (avant le pli).
- Après le pli, rejeu du registre du dépôt (`apps/harness/data/kata/registry/wave1.json`, `811fcd57…`) par `projectCell`,
  `buildPolicyTable` et `contentProblems` : 32 tables, 280 lignes, `{recompute_held: 32, short_digest: 4}`, **0** `vocabulary`.
- red-proof après le pli, `--base 1cddd2e5 --draw 7 --seed 1` : 7 tests F2P, 7 tueurs tirés, 7 tués (dont l.360 et l.343).
- Tests touchés et lecteurs (`spec-venue-fields`, `spec-publish`, `spec-1-1-0-release`, `spec-retire-path`, `short-digest-floor`,
  `kata-recalc`, `runbook-retire`, `surfaces-1-1-0`) : 101/101 sous Node 24.
- Après le pli du delta. Le tronc `591b3a30` est fusionné par `cbfb5f7f` (« Merge the trunk ») ; la fusion est pure : même patch-id
  (`2ce7dcf1…`) pour `1cddd2e5`→`9b7bdc62` et pour `591b3a30`→`cbfb5f7f`.
  - Rejeu du registre du dépôt (`811fcd57…`) : 32 tables, 280 lignes, `{recompute_held: 32, short_digest: 4}`, **0** `vocabulary`
    (592 au tronc `591b3a30`).
  - red-proof `--base 591b3a30 --draw 8 --seed 1` : OK. 8 tests F2P (base `assert-fail`, gel `pass`) ; 8 tueurs tirés, 8 tués par
    assertion, dont `:357`. `RED-PROOF.json` : sha256 `abd4d065…`.
  - Mutants de la G2 delta, tirés seuls (fichier de test entier, restauration vérifiée par sha256 `d0bf16aa…`) : X5, X1 et X6
    survivent au fichier de test de `9b7bdc62` (7/7 verts) ; au gel, `ERR_ASSERTION` les tue (test 8, test 6, test 6). X10 survit aux
    deux : équivalent (ci-dessus). Les dix tueurs du fichier sont tués par assertion.
  - Tests touchés et lecteurs : les huit fichiers ci-dessus et `packages/contracts/test/policy-table.test.ts`, 118/118 sous Node 24.
  - `tsc --noEmit`, eslint, lang-gate, gate:vocab, lint-ratchet (69/69), export-public `--check` et winlint : propres.
  - Taille, forme de la CI (`591b3a30...HEAD`) : 3 fichiers, +173 −6, soit 179 lignes, sous 547.
