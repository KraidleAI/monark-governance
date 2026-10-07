# G0 du lot IMPORT-SPECIFIERS-AST-1 : les spécificateurs lus sur l'arbre syntaxique, et SERVED-WALK-LOADS-1

RECHERCHES, 2026-10-07. Base `5437cd0d` (`lot/etude-suite`), branche `recherches/import-specifiers-ast-1`. Décision de MONARK
`recherches:b56f2ad` (`coordination/messages/2026-10-07-MONARK-vers-RECHERCHES-a1-m1-decision.md`, §1 et §2), sur la G2 de l'adoption
de l'aide par a1 (`coordination/pieces/2026-10-07-g2-recherches/G2-a1-adopt-1f.json`, constats M-1 et m-1). Auteur : un worker
`claude-opus-5-5`, effort `max` passé par l'orchestrateur de RECHERCHES ; horloge lue à 22:17 UTC (`date -u`). Commits : `e0f45e1f`
(tests rouges), `56b01a79` (correctif), puis ce G0. ETAT et JOURNAL : à MONARK (sa part de l'erreur, `dd734ea`, va au JOURNAL).

## 1. Constat

- `apps/harness/test/helpers/import-specifiers.ts` l.26 (base) : `importSpecifiers` rendait `ts.preProcessFile(text, true, true)`, un
  scanner de jetons. Il ne lit pas `export * as ns from "x"` (après `*`, il attend `from`). Il ne sait pas qu'un `/` ouvre un littéral
  d'expression régulière : un `'` dedans ouvre une chaîne fantôme jusqu'au bout de la ligne, un `` ` `` un gabarit fantôme jusqu'au
  backtick suivant, et ce qu'ils couvrent n'est pas lu. `forbiddenLoads` lit bien l'arbre, mais ni les déclarations ni `import()` d'un
  littéral.
- Mesuré à la base : l'aide rend `[]` sur chacune des huit formes G1 à G8 de la G2. G8 (`import { runInThisContext } from "node:vm"`
  entre deux expressions régulières à backtick), insérée dans `policy-verifiers.ts`, survit à `test/verifiers-list.test.ts` (F5 des
  notes de la G2). L'en-tête (l.14-17) disait `node:vm` et les deux autres « closed only by the specifier list » : c'était faux.

## 2. Correctif (`56b01a79`)

- Une seule analyse, `treeOf(text)` (l.36, `ts.createSourceFile`, celle que `forbiddenLoads` faisait déjà, l.76). `importSpecifiers`
  (l.46-55) parcourt cet arbre ; `specifierNode` (l.39-44) rend le nœud du spécificateur : `moduleSpecifier` de toute déclaration
  d'import ou d'export (`export * as ns from` compris), la référence de `import x = require()`, le premier argument d'un `import()` ou
  d'un `require()`, l'argument d'un import de type ; seul un littéral (chaîne ou gabarit sans substitution) est retenu (l.50).
  `ts.preProcessFile` ne sert plus. Signature inchangée, `(text: string) => string[]`.
- L'en-tête est réécrit : ce que lit l'arbre, ce que lisait le scanner, et, à la place de la phrase fausse, ce qui ferme vraiment les
  trois chargeurs (la liste des spécificateurs que le test de chaque module balayé affirme, lue sur l'arbre ; les chargements que nomme
  `forbiddenLoads` ; la limite IMPORT-AST-RUNTIME-NAME-1, inchangée) et le fait que la marche servie n'affirme aucune liste.
- Mêmes listes qu'avant (`compare.mts`, hors dépôt) : les 27 fichiers `.ts` de `apps/harness/src` (117 spécificateurs) ; le texte du cas
  de 1f (ses 9, dans l'ordre) et celui du cas d'a1 (ses 5). Sur les 732 fichiers de code suivis (hors `fixtures/`, `data/`, `public/`),
  5 diffèrent, tous des tests où le scanner lisait `import '${s}'` dans le texte d'un gabarit ; l'arbre n'y ajoute rien.
- Écarts voulus : un littéral d'expression régulière n'est plus lu comme spécificateur ; `export type * as ns from` et `import defer`
  sont lus ; `x.require("…")` et les dépendances d'un `define([...])` AMD ne le sont plus (`forbiddenLoads` nomme `require` partout,
  propriété comprise).

## 3. L'arbre épinglé ne bouge pas

`apps/harness/data/verifiers.json` a une entrée (E1), d'arbre `tools/kata-recalc`, et `git diff --name-only 5437cd0d HEAD --
tools/kata-recalc` est vide : les cinq conditions de 1f §6 ne s'appliquent pas à ce lot.

## 4. SERVED-WALK-LOADS-1 (dans ce lot, la taille le permet)

`servedModules` (`apps/harness/test/kata-path.test.ts`) lit chaque module par un paramètre `read` (le fichier, ou une copie qu'un test
lui passe) et affirme `forbiddenLoads(text)` vide sur chacun (l.327). Aujourd'hui 22 modules servis, le même ensemble par la regex de la
marche et par `importSpecifiers`, aucun refusé (`served.mts`). La marche lit encore ses spécificateurs par sa regex (guillemets
doubles) : a1 (#233) la fait passer à `importSpecifiers`. Ici K04 et K05 survivent donc (§7), et meurent à la fusion d'a1 (§8).

## 5. Tests rouges (`e0f45e1f`) et verts (`56b01a79`)

- `test/verifiers-list.test.ts`, `import_helper_reads_specifiers_on_the_syntax_tree` : les huit formes, chacune avec sa liste attendue,
  en une assertion ; puis `import j = require()`, un import de type, une expression régulière qui contient `import "…"`,
  `export type * as` et `require()` d'un gabarit. À `e0f45e1f`, rouge par `ERR_ASSERTION` : les huit rendent `[]` (sur la seconde
  liste, l'aide de la base rendait `./r.ts`, lu dans l'expression régulière, et manquait `./u.ts`). 11 autres tests verts.
- `apps/harness/test/kata-path.test.ts`, `served_walk_refuses_a_load_that_no_specifier_shows` : K-calc puis K-req de la G2 ajoutés à une
  copie de `kata-path.ts` ; `forbiddenLoads` les nomme sur la copie, et la marche doit lever avec ces chargements (`{ actual: loads }`).
  À `e0f45e1f`, rouge par `ERR_ASSERTION` (« Missing expected exception: K-calc », puis, ordre inversé à la main, « K-req ») ; 18
  autres tests verts.
- À `56b01a79` : 12 sur 12, 19 sur 19, `every_killer_line_is_readable` 1 sur 1. Les cas d'aide existants gardent leurs attendus
  octet pour octet ; seul leur tueur suit sa ligne (`:51` → `:80`).

## 6. Tueurs

Déclarés (la ligne au-dessus du test) :
- `apps/harness/test/helpers/import-specifiers.ts:53 CONST "visit(treeOf(text));" -> "found.push(...ts.preProcessFile(text, true, true).importedFiles.map((f) => f.fileName));"` (le scanner à la place de l'arbre)
- `apps/harness/test/helpers/import-specifiers.ts:80 CONST "ts.isStringLiteralLike(n.arguments[0])" -> "true"` (cas servi ; le cas d'aide de 1f garde ce texte)

Dans le corps du test neuf de l'aide, une par ligne neuve : l.36 (`text,` → `"",`), l.40 (`|| ts.isExportDeclaration(n)` retiré), l.41
(`false &&`), l.42 (deux : `ImportKeyword ||` retiré ; `"require"` → `"requires"`), l.43 (`false &&`), l.47 (`[]` → `["./j.ts"]`), l.49
(`undefined`), l.50 (`isStringLiteral`), l.51 (SDL), l.54 (`found.slice(1)`). Dans le corps du cas servi : l.76 (`treeOf("")`) et l.57
(`getBuiltinModule` et `createRequire` retirés de `NAMES`). Lignes sans tueur, de structure seule : l.39, 44, 46, 48, 52, 55.
La ligne neuve de la marche (`kata-path.test.ts:327`) est dans un `*.test.ts`, qu'aucun tueur ne vise : tirée à la main (SDL), le cas
servi rougit par `ERR_ASSERTION` (« Missing expected exception: K-calc »), octets restaurés (sha256 `a1ac638d…`).

## 7. Preuves

- `verifie-ancres.mjs` (`923db533…`, `--ref 5437cd0d`) : 44 tueurs des deux fichiers touchés, l'arbre entier 1 658, tous ANCRE.
- `scripts/mutants/run.mjs --killers --base 5437cd0d` à `56b01a79` (verrou d'hôte partagé, Node 24.21.0) : base 581 verts ; 43 tués sur 44,
  dont les 15 neufs. K16, le tueur du tronc de `kata_path_is_served` (`tools/gate.ts:62`, `?served`), est « non conclu » : la marche
  lit alors `kata-path.ts?served`, et le test rougit par `ENOENT`, pas par une assertion (rejeu : tué). Mesuré pareil sur le test du
  tronc : préexistant, hors de ce lot. `RESULTS.json` `850eb2d4…`.
- red-proof, `--base 5437cd0d --gel 56b01a79 --draw 3 --seed 1007` : REFUSED, 2 jugés, 0 tiré, les deux « green at base: a
  self-confirming test » ; `RED-PROOF.json` `d11462b4…`, digest du gel `d58f14e7…`. C'est par construction : le diff ne change aucun
  code de production (`files.production` vide), l'aide est un fichier d'appui sous `test/`, et red-proof le recopie dans la base, où les
  deux tests tournent donc sur l'aide neuve. `--test-only` refuse aussi (« production changed » : un fichier d'appui modifié compte comme
  production ; `RED-PROOF.json` `202c5f11…`). À la place : `e0f45e1f` rouge et `56b01a79` vert (§5) ; les tests de `56b01a79` sur l'aide
  de la base (blob `109ef3bc`, remise en place puis restaurée, sha256 `14d00842…`) : le test neuf de l'aide rougit par `ERR_ASSERTION`,
  les 30 autres restent verts (le cas servi aussi, puisque sa ligne est dans la marche) ; la marche tirée à la main (§6).
- Les formes en mutants sur les modules du tronc (`gen-trunk-forms.mjs`, table de 14 lignes ; textes de G1 à G8 dans
  `policy-verifiers.ts`, et G5, G7, K04, K05, K-calc, K-req dans `kata-path.ts`) :

| | base `5437cd0d` | `56b01a79` |
|---|---|---|
| G1 à G7 dans `policy-verifiers.ts` | tuées par la copie paresseuse (une cible relative ne s'y charge pas) ; G1, G5, G7 aussi par le contrôle du texte (le nom du garde) | tuées, toutes aussi par la liste des spécificateurs |
| G8 (`node:vm`) dans `policy-verifiers.ts` | **survit** | tuée par `verifier_list_date_rule_is_the_spec_publish_rule` |
| G5, G7 dans `kata-path.ts` | tuées (`kata_path_is_served`) | tuées, le même |
| K-calc, K-req | **survivent** | tuées par la marche (3 tests) |
| K04, K05 | survivent | survivent (§4 ; tuées à la fusion d'a1, §8) |

  `RESULTS.json` : base `85b530aa…`, tête `b696f4b0…`.

## 8. Pour la fusion du tronc dans a1 (#233, puis #236)

Rejouée hors dépôt (clone jetable, `0e31950b` + `56b01a79`, `--no-ff`) :
- un seul conflit, `apps/harness/test/kata-path.test.ts`, trois blocs : l'import devient `import { forbiddenLoads, importSpecifiers }
  from "./helpers/import-specifiers.ts";`, la marche lit `const text = read(file);`, affirme `forbiddenLoads`, puis suit
  `importSpecifiers(text)` (`resolve-a1.mjs`) ;
- le tueur d'a1 `import-specifiers.ts:26` (`policy-committed.test.ts:135`) perd sa ligne ; même mutation sur la ligne neuve :
  `apps/harness/test/helpers/import-specifiers.ts:50 CONST "ts.isStringLiteralLike(s)" -> "ts.isStringLiteralLike(s) && text[s.getStart()] === '\"'"` ;
- à cette tête : `policy-committed` 7 sur 7, `kata-path` 19 sur 19, `verifiers-list` 12 sur 12, `killer-lines` 1 sur 1 ; `tsc` 0, `eslint`
  0 ; 1 665 tueurs ANCRE ;
- mutants (`gen-a1-forms.mjs`, 22 lignes) : G1 à G8 tuées chacune par son test (T-1 pour G1, G2, G3, G8 ; les épingles pour G4 ; la
  marche pour G5, G7 ; les lignes réservées pour G6) ; les textes du générateur de MONARK (`d0c6d2e8…`) R15 à R19, P09 à P11, K04, K05,
  N07 et N08 tués ; **P11** (la forme calculée, côté épingles) meurt par `forbiddenLoads` : `[importsOf, loadsOf]` rend
  `[[], ["l.9: import() of a specifier that is not a literal"]]` ; K-calc et K-req tués par la marche. 22 sur 22 ;
- `--killers --base 0e31950b` (les trois fichiers de test que la fusion change) : 50 tués sur 51, dont le tueur ré-ancré d'a1 ; K16
  comme au §7. `RESULTS.json` `85727ae0…` (table et tueurs, un lancement).

## 9. Taille et portes

- R-25, forme de la CI (les 21 pathspecs lues dans `ci.yml`), `5437cd0d...HEAD` : 3 fichiers, +100 −16, soit **116** (borne de lot
  547 ; borne ADR 1205). Ce G0 est hors du compte (`docs/**/*.md`).
- `tsc --noEmit` 0 ; `eslint` des trois fichiers 0 ; `gate:vocab` OK ; `lang:gate` OK ; `lint:ratchet` 69/69 ; `export:check` OK ;
  winlint (`676416fe…`, `--base 5437cd0d`) : 3 fichiers, aucun risque Windows.
- `test:main` (Node 24.21.0, Linux, à `75d55651`, la tête de ce G0 avant cette ligne) : 2 927 tests, 2 905 verts, 0 rouge, 22 sautés,
  sortie 0 (deux tests de plus qu'au tronc).

## 10. Ce qui n'est pas fait

- Windows : rejoué par MONARK à la fusion.
- La marche servie ne lit pas encore ses spécificateurs par `importSpecifiers` : c'est le changement d'a1 (#233), §4 et §8.
- Les corps de #233 et #236 et leurs G0 §8 (« re-exports ») : corrigés à leur pli, pas ici.
- Non essayé : `import source` (TypeScript 6.0.3 ne le lit pas) ; un texte que l'analyseur de TypeScript et le retrait des types de Node
  liraient autrement.
- Le tueur du tronc `tools/gate.ts:62` tue par `ENOENT` et non par une assertion (§7) : préexistant, laissé à MONARK.
