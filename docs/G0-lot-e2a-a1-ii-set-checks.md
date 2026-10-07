# G0 du lot E-2a a1-ii : les règles d'ensemble du lecteur des tables engagées, la ligne réservée, et le commentaire de `registry.ts`

RECHERCHES, 2026-10-07. Base : la tête de a1-i, `15fafa202a60d2fc06a80ab426bec23f5bb2722c` (branche
`recherches/e2a-a1-i-committed-pins`, sur `lot/etude-suite` = `1cddd2e5`). Plan : G0 court d'E-2a v6.1
(`recherches:coordination/pieces/2026-10-07-e2a-g0-v4/G0-lot-e2a-loader-wave1.md`), accepté par MONARK (`recherches` `51fe3ee`).

- **Demande** : second morceau du repli de a1 (plan §5.1) : « règles d'ensemble du lecteur (classe épinglée et retenue refusée, union
  = les 32 classes, ligne réservée refusée par `kataKeyReserved`) (~20) ; leurs cas de T-1 (~60) ; `registry.ts` l.15-16 (~4) » ;
  rouge à la base du morceau : « les lignes forgées sont admises par a1-i ».
- **Provenance** : worker `claude-opus-5-5`, horloge lue (`date -u`) à 09:47 UTC pour ce G0. Worktree détaché neuf du scratchpad,
  branche `recherches/e2a-a1-ii-set-checks` ; `node_modules` lié en dur, retiré à la fin. Node 24.21.0, Linux.
- **Zone** : `apps/harness/src/policy-committed.ts`, `apps/harness/src/policy-classes.ts` (fin de fichier),
  `apps/harness/src/tools/registry.ts` (l.15-16, sur place), `apps/harness/test/policy-committed.test.ts`.
- **Ordre de fusion** : après a1-i (et donc après 1f et 2a). Demande en brouillon, base `recherches/e2a-a1-i-committed-pins`.

## 1. Construction

- **`kataKeyReserved` dans le graphe servi** (plan §3.1 : « Si #225 fusionnait sans ce pli, a1 le ferait ») : #225 n'est pas au
  tronc (ouverte, tête `473023d3`). Ce lot ajoute donc en fin de `policy-classes.ts` (l.48-58) **les onze lignes de #225 à l'octet
  près** (`KATA_RESERVED_IDS`, `kataKeyReserved` ; `git diff 1cddd2e5 <tête> -- apps/harness/src/policy-classes.ts` est égal au même
  diff de #225 à `473023d3`). Les deux côtés font le même ajout au même endroit : la fusion de l'autre reste propre, tant que #225 ne
  change pas ces lignes. Si elle les change avant de fusionner, le second des deux à fusionner se rebase sur le premier.
- **`policy-committed.ts`** : import de `kataKeyReserved` seul depuis `./policy-classes.ts` (l.11) ; trois règles d'ensemble avant
  la boucle : une entrée de classe kata répétée (l.55), une classe retenue qui n'est pas une classe kata (l.56), une classe à la fois
  épinglée et retenue (l.57). Ainsi épinglées, retenues et autres classes sont exactement les classes kata (les épinglées hors des
  entrées sont déjà refusées, l.70). Dans la boucle, après `assertPolicyTableFile` : une ligne dont `kata_id` ou `venue` est réservé
  est refusée (l.73), la moitié chargeur de la réservation de `ca-probe`. Ancres à la tête du pli du §6 (`e67310c8`) : la fusion
  d'a1-i y ajoute le refus nommé du JSON (l.62-67), d'où l.65 → l.70 et l.68 → l.73.
- **`tools/registry.ts` l.15-16**, réécrites sur place, sans ligne ajoutée : `schema-projection.ts` « owns a `node:fs` read at load,
  as `../policy-committed.ts` does for the committed tables » (plan §3.1, constat 17).
- **Aucun octet servi ne bouge** : le lecteur n'est toujours importé par aucun module servi ; `policy-classes.ts` est servi, mais
  ses ajouts ne sont appelés par rien de servi.

## 2. Tests rouges et tueurs

| Test | Ce qu'il tient | Rouge à la base (a1-i) | Tueur |
|---|---|---|---|
| `committed_tables_reader_refuses_pinned_held_classes` (l.95) | classe épinglée et retenue (les deux listes réelles) ; classe retenue hors des classes kata ; entrée répétée : refus nommés ; une classe de bande épinglée avec les listes réelles est admise ; les 32 classes contiennent les retenues et l'épinglée | assertion : admis | `apps/harness/src/policy-committed.ts:57 SDL "if (Object.hasOwn(pins.tables, cls))" -> ""` |
| `committed_tables_reader_refuses_reserved_rows` (l.107) | une ligne sous `kata_id` `ca-probe`, une sous `venue` `ca-probe` : refus nommés avec la clé de case ; un seul spécificateur de `./policy-classes.ts`, lu par l'extracteur de T-1, et l'union des noms de toutes ses lignes `import { … }` est incluse dans {`kataKeyReserved`, `KATA_RESERVED_IDS`} (§6 ; dans les deux guillemets depuis le §7) | assertion : admis | `apps/harness/src/policy-committed.ts:73 CONST "kataKeyReserved(r.kata_id, r.venue)" -> "false"` |

- Les trois tueurs du lecteur posés par a1-i sont réancrés : avant le pli, l.36 → l.37, l.50 → l.53, l.54 → l.61 ; depuis la fusion
  du pli d'a1-i (§6), ses tueurs neufs, l.11 → l.12 (import de `gate.ts`) et l.50 → l.53 (`in`), et l.54 → l.61. Rejoués : tués.
- **Mutants équivalents** : balayage des lignes neuves (l.55, l.56, l.57, l.73 entière, puis chacun de ses deux arguments mis à
  `null`) : tous tués. `Object.hasOwn` → `in` à l.57 (O5 de la G2) survit : équivalent, l.56 n'admet que des classes kata.

## 3. Preuves

- **red-proof** : `node scripts/red-proof.mjs --base 15fafa202a60d2fc06a80ab426bec23f5bb2722c --gel <tête du code> --repo <worktree>
  --out <dossier> --draw 2 --seed 1007`, Node 24.21.0, Linux : sortie 0, « 2 judged, 4 unchanged, 2 killer(s) drawn », deux F2P
  (rouges à la base par assertion), deux tueurs tués. `RED-PROOF.json` à la première tête du code (`3c6ce86f`), sha256
  `92d2afdc4521efabdfd6743c4793e3f5b16e7ce0b71af18e3e8507c0c53f5333` (celui d'a1-i est au §3 de son G0). Après le pli, contre la
  nouvelle base (`--base ea4a2679`, tête du code `e67310c8`) : sha256
  `2a924432cb066433e5d4e61bb142ab96402187b662eb04898e81462daa9c7592` (§6).
- **Octets servis inchangés** : suite du harnais et tests des surfaces servies (comme a1-i) : 354 tests, 354 verts.
- `tsc --noEmit` 0 ; `eslint .` 0 ; `gate:vocab` 0 ; `lang:gate` 0 ; `lint:ratchet` 69/69 ; `export:check` 0 ; winlint `--base
  15fafa20` : 4 fichiers, aucun risque Windows.

## 4. Taille

- R-25, forme de la CI, contre la base de la demande (a1-i) : 4 fichiers, 49 insertions, 6 suppressions, **55** (plan : ~168). a1
  entier (a1-i + a1-ii) contre le tronc : 234 (232 insertions, 2 suppressions). Après le pli (§6) : **56** (50 + 6) contre
  `ea4a2679` ; a1 entier contre `1cddd2e5` : 246 (244 + 2), sous 547.

## 5. Ce qui n'est pas fait

- La couture et la clause d'état engagé : lots a2 et a3. Les épingles restent vides jusqu'au lot c.

## 6. Pli de la G2 de #233 et #236 (MONARK `6fb4653`, pièce `g2-233-236.json`), 2026-10-07

- **Provenance** : worker `claude-opus-5-5`, effort: max ; horloge lue (`date -u`) à 12:10 UTC au début du pli d'a1, 12:37 UTC pour
  ce G0 (fusion à 12:26, pli à 12:29, `TZ=UTC git log`). Worktree détaché neuf du scratchpad à `37578328` (`git fetch` à refspecs
  explicites dans `/home/user/monark-governance`, dont aucun fichier n'est touché) ; `node_modules` lié en dur (`cp -al`), retiré à
  la fin. Node 24.21.0, Linux.
- **Base de la demande** : la tête d'a1-i après son pli, `ea4a2679fea922e4e13e853a2e465c8b92a68781` (G0 d'a1-i, §6), fusionnée dans
  la branche sans réécriture : commit de fusion `81e2a59d` (« Merge the a1 changes »). Deux conflits, chacun résolu en gardant les
  deux côtés : le commentaire du lecteur nomme le refus du JSON et les règles d'ensemble (quatre lignes, comme avant) ; les deux
  tueurs changés par a1-i gardent ses mutations neuves, ancrées aux lignes de cette branche (l.12 et l.53). Le tueur des lignes
  réservées passe de l.68 à l.73. `verifie-ancres` (`--ref ea4a2679 --ref 37578328`) : 6 tueurs du fichier, 6 ancrés ; sur l'arbre,
  1 525 ancrés, 0 dérive, 0 perdu. Le pli lui-même est au commit `e67310c8` ; les ancres des §1 à §6 sont à cette tête.

| Constat | Pli | Où |
|---|---|---|
| m : `.match` sans `g` ne lit que la première ligne d'import de `policy-classes.ts` | `matchAll` avec `/gm` sur chaque `import { … } from "./policy-classes.ts"` : l'union des noms (virgules, espaces et retours à la ligne admis) doit être incluse dans {`kataKeyReserved`, `KATA_RESERVED_IDS`} et non vide ; et un seul spécificateur `./policy-classes.ts`, compté par `importsOf`, l'extracteur de la M d'a1-i | `test/policy-committed.test.ts:114-116` |
| les cinq constats d'a1-i | pliés au G0 d'a1-i (§6), reçus ici par la fusion | `81e2a59d` |

- **Mutants** (mêmes règles qu'au G0 d'a1-i, §6) :
  - avant le pli, à la fusion `81e2a59d` : cinq survivent : O24 (seconde ligne `import { kataClassEntries } from
    "./policy-classes.ts";`), un ré-export de `kataClassEntries`, `void import("./policy-classes.ts")`, un import d'espace de noms
    en plus, et une seconde ligne qui n'importe qu'un nom permis (`KATA_RESERVED_IDS`). Un import sur plusieurs lignes ou un nom de
    plus sur la ligne existante étaient déjà tués ;
  - après le pli : les sept tués, par assertion, par `committed_tables_reader_refuses_reserved_rows` ; les dix-sept mutants d'import
    et d'`Object.hasOwn` d'a1-i, rejoués ici (O25 avec `KATA_RESERVED_IDS`, le nom de la pièce) : tous tués ;
  - balayage à la main des deux modules à cette tête, a1-i et a1-ii (24 dans le lecteur et `policy-classes.ts`, 6 dans les
    épingles) : tous tués, sauf les deux équivalents déclarés (`names.sort()` → `names` ; O5). Deux rougissent par une erreur levée
    et non par assertion, comme à a1-i (`"ENOENT"` → `"EACCES"` ; `COMMITTED_TABLES` non vide) ;
  - deux formes permises restent vertes, 6 sur 6 (pas de faux positif) : l'import sur trois lignes avec une virgule finale, et
    `import { KATA_RESERVED_IDS, kataKeyReserved } from "./policy-classes.ts";`.
- **Mesures à `e67310c8`** : red-proof `--base ea4a2679 --draw 2 --seed 1007` : sortie 0, « 2 judged, 4 unchanged, 2 killer(s)
  drawn », deux F2P, deux tueurs tués (l.73 et l.57) ; `RED-PROOF.json` au §3. Sur a1 entier, `--base 1cddd2e5 --draw 6 --seed
  20261007` : sortie 0, six `new-module`, six tueurs tués ; sha256 `5ca79aa24c787fbf21a872c9f0cc931521e763badfde62ef34de4a916a8da9d3`.
  Suite du harnais et tests des surfaces servies : 354 tests, 354 verts. `tsc --noEmit` 0 ; `eslint .` 0 ; `gate:vocab` 0 (350
  fichiers) ; `lang:gate` 0 ; `lint:ratchet` 69/69 ; `export:check` 0 ; winlint `--base ea4a2679` : 5 fichiers, aucun risque
  Windows. R-25 (forme de la CI) au §4.

## 7. Fusion de la fermeture des guillemets simples d'a1-i (MONARK `fbadb0d`), 2026-10-07

- **Provenance** : la fusion `99fbe5ed` (13:08 UTC) et le pli `dfe57e2d` (13:11 UTC, `TZ=UTC git log`) sont d'un worker
  `claude-opus-5-5`, effort: max, arrêté avec le conteneur vers 13:15 UTC avant de les pousser (erratum 26 de l'atelier). Repris,
  vérifiés et mesurés par un worker `claude-opus-5-5`, effort: max ; horloge lue (`date -u`) à 13:21 UTC au premier passage. Même
  worktree détaché du scratchpad (`wt-a1ii-g2`, à `dfe57e2d`, sans changement non commité) ; `node_modules` lié en dur
  (`cp -al`), retiré à la fin. Node 24.21.0, Linux. `dfe57e2d` poussé en avance rapide sur `15642c0a` à 13:33:57 UTC, suite verte.
- **Base de la demande** : la tête d'a1-i après son §7, `096373ab029ac63f0be3b4a6f20cc2a6b4725f42`, fusionnée sans réécriture :
  commit de fusion `99fbe5ed` (« Merge the a1 changes »), sans conflit. Refaite à part depuis `15642c0a` dans un worktree jetable :
  même arbre (`ebc3c5bc`). Elle apporte l'extracteur partagé (`test/helpers/import-specifiers.ts:6`, les deux guillemets),
  `importsOf` qui le lit (`test/policy-committed.test.ts:22-23`), le cas `import_specifiers_are_read_in_both_quotes` (l.132-136,
  son tueur sur l'extracteur) et la marche de `servedModules` dans `kata-path.test.ts`. Aucune ligne de production ne bouge : les
  tueurs de ce fichier gardent leurs ancres (l.57 et l.73, et ceux d'a1-i réancrés au §6, l.12, l.53, l.61).
- **Pli** (`dfe57e2d`, une ligne) : `committed_tables_reader_refuses_reserved_rows` compte le spécificateur `./policy-classes.ts`
  par `importsOf`, qui lit les deux guillemets depuis la fusion ; les noms qu'il vérifie n'étaient lus que sur les lignes
  `import { … } from "./policy-classes.ts"`. Un import permis entre guillemets simples était donc compté mais sans nom, et refusé
  (`names.length > 0` faux). La regex des noms lit `["']` des deux côtés du chemin (`test/policy-committed.test.ts:114`) ; le
  compte, lui, reste celui de l'extracteur.
- **Rouge d'abord et mutants** (un mutant à la fois dans le worktree, le fichier de test rejoué, octets restaurés et vérifiés par
  sha256 ; l'état « avant » rejoue l'ancienne regex des noms dans le même passage) :
  - deux formes permises entre guillemets simples, `import { kataKeyReserved } from './policy-classes.ts';` et un import sur quatre
    lignes de `KATA_RESERVED_IDS` et `kataKeyReserved` avec une virgule finale : **rouges avant le pli** (par assertion, faux
    refus), **vertes après** ;
  - huit formes refusées : entre guillemets simples, un nom de plus sur la ligne (`kataClassEntries`), une seconde ligne d'import,
    un ré-export, `void import(…)`, un import d'espace de noms en plus, une seconde ligne qui n'importe que `KATA_RESERVED_IDS`, un
    import sur quatre lignes avec `kataClassEntries` ; et le témoin O24 entre guillemets doubles : **toutes rouges, avant comme
    après**, par assertion, par ce seul test (6 sur 7 verts).
- **Mesures à `dfe57e2d`** (tête du code ; le commit de ce § ne touche que ce G0) : red-proof `--base
  096373ab029ac63f0be3b4a6f20cc2a6b4725f42 --gel <worktree> --repo <worktree> --draw 2 --seed 1007` : sortie 0, « 2 judged, 5
  unchanged, 2 killer(s) drawn », deux F2P (rouges à la base par assertion), deux tueurs tués par assertion (l.73 et l.57) ;
  `RED-PROOF.json` sha256 `9f61afd88979d28396a5653b84d22bc70ad8c657e9d940c4dd1e6e242b60476f` (digest du gel `ebf1d74f8f2cefa5…`).
  `verifie-ancres` (`--ref 096373ab --ref 15642c0a`) : 1 526 ancrés, 0 dérive, 0 perdu ; les deux fichiers de test qu'a1 touche :
  25 sur 25. Suite du harnais et tests des surfaces servies : 355 sur 355 (354 au §6, plus le cas de l'extracteur). `tsc --noEmit`
  0 ; `eslint .` 0 ; `gate:vocab` 0 (350 fichiers) ; `lang:gate` 0 ; `lint:ratchet` 69/69 ; `export:check` 0 ; winlint `--base
  096373ab` : 5 fichiers, aucun risque Windows. R-25 (forme de la CI) contre `096373ab` : **56** (50 + 6, inchangé) ; a1 entier
  contre le tronc `6a1b1d43` (base de fusion `1cddd2e5`) : 263 (259 + 4), sous 547.

## 8. Fusion de l'adoption de l'aide partagée par a1-i (MONARK `dd734ea`), 2026-10-07

- **Provenance** : worker `claude-opus-5-5`, effort: max (le même qu'au G0 d'a1-i, §8) ; horloge lue (`date -u`) à 19:57 UTC au
  début de ce morceau, 20:05 UTC pour ce §. Worktree détaché neuf du scratchpad (`wt-a1-adopt-ii`, à `b854f727`) ; `node_modules`
  lié en dur (`cp -al`), retiré à la fin. Node 24.21.0, Linux.
- **Base de la demande** : la tête d'a1-i après son §8, `7038848d4c7f451169f86f1dcca46e7eca6e3359` (fusion du tronc `1df4e44f`,
  aide de 1f, `forbiddenLoads` dans T-1 et le test des épingles), fusionnée sans réécriture : commit `dc8ce9c3` (« Merge the base
  branch »), parents `b854f727` et `7038848d`, **sans conflit**. Cette branche ne changeait pas l'aide, et ses onze lignes de
  `policy-classes.ts` sont au tronc à l'octet près (blob `3ad24e54`, déjà à `1df4e44f`) : elles sortent du diff de la demande.
  Aucune ligne de production ne bouge ; les tueurs gardent leurs lignes (l.12, l.53, l.57, l.61, l.73 du lecteur, l.11 des épingles,
  l.26 de l'aide, réancrée par a1-i). Pas de pli : le compte du spécificateur `./policy-classes.ts`
  (`test/policy-committed.test.ts:118`) passe par `importsOf`, donc par `importSpecifiers` de l'aide ; la regex des noms (l.117) est
  propre à ce test et reste.
- **Ce que lit le test des lignes réservées** (au lieu de « in one import only ») : un seul spécificateur `./policy-classes.ts` parmi
  ceux que liste `importSpecifiers` (imports, imports à effet de bord, imports de type, ré-exports, `export * from`, `import()` ou
  `require()` d'un littéral ou d'un gabarit sans substitution, dans les deux guillemets, commentaires sautés) ; et les noms de
  chaque ligne `import { … } from` de ce module, dans les deux guillemets, inclus dans {`kataKeyReserved`, `KATA_RESERVED_IDS`} et
  non vides. Côté fermé : un import permis avec un commentaire avant le chemin est compté sans nom, donc refusé (mesuré,
  `out-ii-w5.json` `6e0a4a1d…`).
- **Mutants** (règles du G0 d'a1-i, §8 ; S0 `b854f727`, ancien extracteur ; S2 `dc8ce9c3`) :

| Mutant | Texte (après l'import de `./policy-classes.ts` du lecteur) | S0 | S2, tué par |
|---|---|---|---|
| N07 | `import { kataClassEntries } from /* reviewed */ "./policy-classes.ts";` | survit | tué, lignes réservées (deux spécificateurs) |
| N08 | ``void import(`./policy-classes.ts`);`` | survit | tué, lignes réservées (deux spécificateurs) |

  - R15 à R19, P09-P11, K04, K05 (textes du G0 d'a1-i, §8) : S0 survivent tous ; S2 tués par assertion, par T-1, le test des
    épingles et `kata_path_is_served`, comme à a1-i.
  - Hors de la liste : un spécificateur calculé de `./policy-classes.ts` dans le lecteur survit à S0 ; à S2 il est tué par
    assertion par T-1 (`forbiddenLoads`), le compte des lignes réservées ne le voyant pas. Les formes N01 à N05, N09, N10, un
    `import()` à guillemets simples et une seconde ligne qui n'importe que `KATA_RESERVED_IDS` : tuées par assertion par le test des
    lignes réservées. Les trois témoins W02 (trois lignes, virgule finale), W03 (les deux noms permis) et W04 (guillemets simples)
    restent verts, à S0 comme à S2 (pas de faux positif).
  - 61 mutants à S2 : 57 tués par assertion, 3 témoins verts ; le survivant est le spécificateur calculé dans `kata-path.ts`, la
    limite nommée au G0 d'a1-i, §8 (item proposé SERVED-WALK-LOADS-1). Sorties : `out-ii-s0.json` `a9c633dd…`, `out-ii-S2.json`
    `b4043205…` (`spec-ii.json` `0ab0bfcb…`, même harnais).
- **Mesures à `dc8ce9c3`** (tête du code ; le commit de ce § ne touche que ce G0) : red-proof `--base
  7038848d4c7f451169f86f1dcca46e7eca6e3359 --gel dc8ce9c3d6cb46861db93291ca468a91d4252c61 --repo <worktree> --draw 2 --seed 1007` :
  sortie 0, « 2 judged, 5 unchanged, 2 killer(s) drawn », deux F2P (rouges à la base par assertion), deux tueurs tués par assertion
  (l.73 et l.57) ; `RED-PROOF.json` sha256 `562b51b7808728c22a4e9ae0a5de7bcdb9ee8ffb6fe17ad47fc8ab7e87c731f2`. Sur a1 entier,
  `--base 1df4e44fd3e62aa9291005fe90f91292c5344bc4` (base de fusion avec le tronc) `--draw 7 --seed 20261007` : sortie 0, sept
  `new-module`, 18 inchangés, sept tueurs tués par assertion (l.12, l.53, l.57, l.61, l.73, l.11 des épingles, l.26 de l'aide) ;
  sha256 `9abaf939137cd5c499347a67f207fa7272dd8effe3078b8e1c2b390a09d755fa`. Suite du harnais et tests des surfaces servies : 358 sur
  358 ; avec `killer-lines`, `verifiers-list` et `recompute-report` : 377 sur 377. `tsc --noEmit` 0 ; `eslint .` 0 ; `gate:vocab` 0
  (351 fichiers) ; `lang:gate` 0 ; `lint:ratchet` 69/69 ; `export:check` 0 ; winlint `--base 7038848d` : 4 fichiers, aucun risque
  Windows. `verifie-ancres` (`--ref b854f727 --ref 7038848d`) : 1 650 ancrés, 0 dérive, 0 perdu ; les deux fichiers de test d'a1 :
  25 sur 25. R-25 (forme de la CI) contre `7038848d` : **45** (39 + 6 ; 56 avant, les onze lignes de `policy-classes.ts` sortant du
  diff) ; a1 entier contre le tronc (`5437cd0d`, base de fusion `1df4e44f`) : 249 (245 + 4), sous 547.
