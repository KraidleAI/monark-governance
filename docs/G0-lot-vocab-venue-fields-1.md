# G0 du lot VOCAB-VENUE-FIELDS-1 : la venue épinglée de la vague 1 masquée dans les colonnes d'une ligne de table

RECHERCHES, 2026-10-07. Base `177b5755` (lot/etude-suite). Constat de MONARK, décision de RECHERCHES `76ffa25`.

Auteur : RECHERCHES ; rédaction initiale et pli de la G2 (MONARK, `2026-10-07-MONARK-vers-RECHERCHES-g2-221-222.md`, pièce
`g2-221-222.json` clé `0`) par un worker `claude-opus-5-5` (effort non exposé au worker), horloge du pli lue à 09:05 UTC. Le pli est
construit sur le tronc `1cddd2e5` (après #228), fusionné dans la branche.

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
- restent refusés : une autre valeur dans ces champs (casse comprise), le nom dans tout autre champ, en texte libre, hors table, et tout
  fichier dont les octets ne sont pas une écriture stable de sa valeur : membre échappé, répété, ou effacé par une clé dupliquée.

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

## Tests (`test/spec-venue-fields.test.ts`, lignes réelles de forme : registre synthétique semé)

1. venue épinglée dans `venue` et `trial_id` : acceptée (fichier de table, et table du fichier de vecteurs écrite avec espaces) ;
2. autre valeur dans `venue` ou `trial_id` : refusée par les deux passes ;
3. nom hors des deux champs, ou table hors des deux portées, ou membre répété ou échappé, ou les trois fichiers de vecteurs façonnés
   de la G2 (P1 : `venue` échappé et membre égaré effacé par doublon ; P1b : la même chose sur `trial_id` ; P5 : `trial_id` répété) :
   refusé ;
4. rejeu des 32 tables du registre synthétique : 0 problème `vocabulary` ;
5. passe décodée liée à la même épingle ;
6. passe octets : les écritures stables (canonique, compacte + LF) passent, P1, P1b et P5 sont refusés par la passe octets ;
7. une table de forme réelle sans `recompute` n'a aucun problème, tous codes confondus (compose `contentProblems` et le masquage).

## Tueurs

- scripts/spec-publish.mjs:346 CONST "row.venue === pin" -> "row.venue === \"KEY\""
- scripts/spec-publish.mjs:348 CONST "t[2] === pin" -> "t[2] !== \"\""
- scripts/spec-publish.mjs:344 SDL (la ligne de portée)
- scripts/spec-publish.mjs:137 CONST "vocabularyHits(venueMaskedText(text, out, kind))" -> "vocabularyHits(text)"
- scripts/spec-publish.mjs:147 CONST "strings(venueMasked(v, out, kind).value)" -> "strings(v)"
- scripts/spec-publish.mjs:360 CONST "w(v) + end === text" -> "true"
- scripts/spec-publish.mjs:343 CONST "structuredClone(v)" -> "v"

## Preuves

- Rejeu réel (`811fcd57…`, hors dépôt, script en dossier de travail) : 32 tables, 280 lignes, **0** problème `vocabulary` (592 à la
  base) ; restent, inchangés, `recompute_held` (attestation synthétique du rejeu) et `short_digest` sur les quatre dir-4h.
- red-proof `--base 177b5755 --draw 5 --seed 1` : 5 tests F2P, 5 tueurs tués (avant le pli).
