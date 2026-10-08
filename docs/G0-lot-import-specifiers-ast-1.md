# G0 du lot IMPORT-SPECIFIERS-AST-1 : les spécificateurs lus sur l'arbre syntaxique, SERVED-WALK-LOADS-1 et la liste fermée du servi

RECHERCHES, 2026-10-07. Base `5437cd0d` (`lot/etude-suite`), branche `recherches/import-specifiers-ast-1`. Décision de MONARK
`recherches:b56f2ad` (`coordination/messages/2026-10-07-MONARK-vers-RECHERCHES-a1-m1-decision.md`, §1 et §2), sur la G2 de l'adoption
de l'aide par a1 (`coordination/pieces/2026-10-07-g2-recherches/G2-a1-adopt-1f.json`, constats M-1 et m-1). Auteur : un worker
`claude-opus-5-5`, effort `max` passé par l'orchestrateur de RECHERCHES ; horloge lue à 22:17 UTC (`date -u`). Commits : `e0f45e1f`
(tests rouges), `56b01a79` (correctif), puis ce G0 (`5a649d84`). ETAT et JOURNAL : à MONARK (sa part de l'erreur, `dd734ea`, va au JOURNAL).

Pli de la G2 de ce lot (`coordination/pieces/2026-10-07-g2-recherches/G2-246-import-ast.json`, `recherches:416be0a`, CORRECTIONS, trois
m) : m-1 et m-2 pliés ; m-3 par la voie (a), décidée par MONARK (`recherches:1696708`,
`coordination/messages/2026-10-07-MONARK-vers-RECHERCHES-246-m3-a.md`). Auteur du pli : un worker `claude-opus-5-5`, effort `max` ;
horloge lue à 23:39 UTC le 2026-10-07, puis à 00:26 UTC le 2026-10-08 (`date -u`). Commits : `5d430ae9` (m-1, m-2, une phrase de
l'en-tête), `0fc7fcec` (test rouge de m-3), `700b4920` (la liste fermée), puis ce G0 mis à jour. Le §11 résume le pli.

Pli du delta de ce lot (`coordination/pieces/2026-10-07-g2-recherches/G2-246-delta.json`, CORRECTIONS, trois m : m-4, m-5, m-6), décidé
par RECHERCHES sous la délégation technique du fondateur (« no debt »). m-4 par la voie (a) : `execve` et `setEngine` ajoutés aux noms que
`forbiddenLoads` rend, et la troisième voie (`Function` par énumération) nommée sous l'item IMPORT-AST-RUNTIME-NAME-1, dont le texte est
élargi. m-5 : la phrase fausse sur le suffixe de requête corrigée partout. m-6 : la seconde marche sans changement ici, portée au pli d'a1
(§8, §10). Base `5437cd0d` inchangée (le tronc a avancé à `e13cfff7` par #244, qui ne touche aucun fichier de ce lot). Auteur du pli : une
instance neuve `claude-opus-5-5`, effort `max`, le 2026-10-08. Commits : `2493d1a0` (test rouge de m-4, correction de m-5 dans le test),
`e79dbc9c` (`execve`/`setEngine` dans `NAMES`, l'en-tête élargi à nombre de lignes constant), puis ce G0 mis à jour. Le §12 résume le pli du delta.

Pli de la seconde G2 de delta (`coordination/pieces/2026-10-07-g2-recherches/G2-246-delta2.json`, `recherches:dfc0198`, CORRECTIONS, deux
m : m-7, m-8), décidé par MONARK (`recherches:1c58876` §2 et §3) et par RECHERCHES (`7ca8ae8`). m-7 comme proposé : le §8 nomme le script
qui a résolu la fusion d'a1 au delta. m-8 par la voie (a) : la limite d'un `execve` appelé au chargement est écrite au §4 (« Restent »), au
§10, dans l'en-tête de l'aide et d'une phrase du corps, et couverte comme classe par l'item neuf TEST-COUNT-FLOOR-1. Note 2 de cette G2 :
le corps prend le libellé décidé (« or constructor ») ; ses notes 3 à 8 sont pliées dans ce G0 (§4 à §9, §12). Base `5437cd0d` inchangée
(le tronc a avancé à `43f46d9f` par #247, qui ne touche aucun fichier de ce lot). Auteur du pli : une instance neuve `claude-opus-5-5`,
effort `max`, le 2026-10-08 ; horloge lue à 04:31 UTC (`date -u`). Commits : `3527f5a1` (l'en-tête de l'aide), puis ce G0 mis à jour. Le
§13 résume ce pli.

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
  `forbiddenLoads` ; la limite IMPORT-AST-RUNTIME-NAME-1, inchangée) et le fait que la marche servie n'affirme aucune liste. Au pli
  (l.19-26, toujours huit lignes, pour qu'aucune ligne de l'aide ne bouge sous ses tueurs) : `registerHooks()` et `register()` de
  `node:module` rejoignent les chargeurs que `forbiddenLoads` ne nomme pas, et la marche servie les refuse par sa liste fermée (§4).
- Mêmes listes qu'avant (`compare.mts`, hors dépôt) : les 27 fichiers `.ts` de `apps/harness/src` (117 spécificateurs) ; le texte du cas
  de 1f (ses 9, dans l'ordre) et celui du cas d'a1 (ses 5). Sur les 732 fichiers de code suivis (hors `fixtures/`, `data/`, `public/`),
  5 diffèrent, tous des tests où le scanner lisait `import '${s}'` dans le texte d'un gabarit ; l'arbre n'y ajoute rien.
- Écarts voulus : un littéral d'expression régulière n'est plus lu comme spécificateur ; `export type * as ns from` et `import defer`
  sont lus ; `x.require("…")` et les dépendances d'un `define([...])` AMD ne le sont plus (`forbiddenLoads` nomme `require` partout,
  propriété comprise).

## 3. L'arbre épinglé ne bouge pas

`apps/harness/data/verifiers.json` a une entrée (E1), d'arbre `tools/kata-recalc`, et `git diff --name-only 5437cd0d HEAD --
tools/kata-recalc` est vide : les cinq conditions de 1f §6 ne s'appliquent pas à ce lot (vrai aussi à la tête du pli).

## 4. La marche servie : SERVED-WALK-LOADS-1, un fichier par spécificateur, la liste fermée

`servedModules` (`apps/harness/test/kata-path.test.ts`, l.330-342) lit chaque module par un paramètre `read` (le fichier, ou une copie
qu'un test lui passe) et s'arrête par assertion, dans cet ordre :
- l.335 (pli de m-1) : `existsSync(file)`, avant toute lecture. Un spécificateur relatif qui ne nomme aucun fichier (un suffixe de
  requête comme `?served` ne nomme aucun fichier, et Node 24 réévalue ce fichier une seconde fois, comme une autre instance de module —
  correction de m-5 du delta) faisait lever `ENOENT` à la lecture, ce que l'outil de mutants ne compte pas comme une mort (K16, §7) ;
- l.337 : `forbiddenLoads(text)` vide (SERVED-WALK-LOADS-1) ;
- l.338 (m-3, voie (a)) : chaque spécificateur non relatif que lit `importSpecifiers(text)` est dans `SERVED_IMPORTS` (l.324-325).

Aujourd'hui 22 modules servis, le même ensemble par la regex de la marche et par `importSpecifiers`, aucun refusé (`served.mts`, puis
`served-specs.mts` au pli). La marche suit encore ses spécificateurs relatifs par sa regex (guillemets doubles) : a1 (#233) la fait
passer à `importSpecifiers`. Ici K04 et K05 survivent donc (§7), et meurent à la fusion d'a1 (§8) ; la liste ne lit que les non relatifs.

La liste fermée, onze noms, chacun avec sa raison (les modules servis qui l'importent à `700b4920`) :

| nom | importé par |
|---|---|
| `node:crypto` | `policy-table-file.ts` |
| `node:fs` | `schema-projection.ts`, `shogen-fixture.ts` |
| `node:http` | `server.ts` |
| `node:path` | `server.ts` |
| `node:stream` | `server.ts` |
| `node:url` | `schema-projection.ts`, `server.ts`, `shogen-fixture.ts` |
| `@modelcontextprotocol/server` | `schema-projection.ts`, `server.ts`, `tools/registry.ts` |
| `@monark/contracts` | `calibration.ts`, `kata-path.ts`, `policy-classes.ts`, `policy-marginal.ts`, `policy-projection.ts`, `policy-served.ts`, `policy-table-file.ts`, `tools/attest.ts`, `tools/calibrate.ts`, `tools/cascade.ts`, `tools/gate.ts`, `tools/registry.ts`, `tools/ukemi-predict.ts` |
| `@monark/hikae` | `calibration.ts`, `kata-path.ts`, `policy-classes.ts`, `policy-marginal.ts`, `policy-projection.ts`, `tools/calibrate.ts`, `tools/gate.ts`, `ukemi-strata.ts` |
| `@monark/monark` | `calibration.ts`, `tools/attest.ts`, `tools/ukemi-predict.ts` |
| `@monark/ukemi` | `tools/cascade.ts` |

Refusés par construction : `node:module` (`registerHooks`, `register`, `createRequire`), `node:worker_threads`, `node:vm`,
`node:child_process`, tout autre module intégré ou paquet, toute URL (`data:`, `file:`, `http:`) et tout chemin absolu ; un import de type
compte aussi (côté fermé). Deux chargeurs n'atteignent aucun module par un import que la liste refuse, et `forbiddenLoads` les nomme à sa
place (pli de m-4 du delta, `e79dbc9c`) : `process.execve`, sur le `process` global, qui remplace le processus ; `setEngine`, porté par
`node:crypto`, qui est sur la liste, et qui charge un objet natif. Hors de l'aide et de son test, ni l'un ni l'autre n'apparaît dans un
fichier de code suivi, au tronc, à la fusion d'a1 ou à #237 (`git grep -w` ; note 3 de la seconde G2 de delta) : les ajouter à `NAMES` ne
refuse rien aujourd'hui. Tout ajout se fait dans le lot qui en a
besoin, avec sa raison écrite à son G0 (MONARK, `1696708`) ; la règle est écrite au-dessus de la constante. Faux positifs : aucun, au tronc
comme à la fusion d'a1 (§8). Restent : un spécificateur relatif que la regex ne suit pas (K04, K05, jusqu'à la fusion d'a1) et, pour
IMPORT-AST-RUNTIME-NAME-1, un chargeur ou un constructeur atteint par un nom bâti ou choisi au runtime. Ce G0 élargit le texte de cet item
(ETAT, à MONARK) à « a loader or constructor reached by a name built or chosen at run time », de sorte qu'il couvre la troisième voie que
la revue de delta a trouvée (m-4) : `Function` pris en énumérant les descripteurs de propriété du prototype d'une fonction, puis appelé
sur un texte — aucun nom n'est construit, mais une valeur est choisie à l'exécution, et la lire voudrait exécuter le code.

Reste enfin un `execve` appelé au chargement (m-8 de la seconde G2 de delta, voie (a)). `forbiddenLoads` nomme `execve` où qu'il soit, mais
la marche tourne dans `kata-path.test.ts`, qui charge lui-même 12 des 22 modules servis : `attestation-binding.ts`, `calibration.ts`,
`class-policy.ts`, `kata-path.ts`, `policy-classes.ts`, `policy-marginal.ts`, `policy-projection.ts`, `policy-served.ts`,
`policy-table-file.ts`, `tools/calibrate.ts`, `tools/gate.ts` et `ukemi-strata.ts` (mesuré à `3527f5a1` par un crochet de chargement ; la
fermeture statique du fichier par `importSpecifiers` donne les mêmes, 16 modules de `apps/harness/src` en tout). Un `execve` appelé au
chargement de l'un d'eux remplace le processus du test avant que la marche ne tourne, et le lanceur compte le fichier pour une seule entrée
verte : aucune assertion de ce fichier ne peut le rapporter. D'où le tueur de `execve` dans une fonction, où la marche le lit et s'arrête
par assertion. Dans les 10 autres modules servis (`http.ts`, `openapi.ts`, `schema-projection.ts`, `server.ts`, `shogen-fixture.ts`,
`tools/attest.ts`, `tools/cascade.ts`, `tools/registry.ts`, `tools/ukemi-predict.ts`, `version.ts`), que ce fichier ne charge pas, la
marche le refuse par assertion (§13). La limite est une classe : un `process.exit(0)` au chargement fait de même, et dans tout fichier de
test qui charge le module. Elle est couverte par l'item neuf TEST-COUNT-FLOOR-1 (MONARK, `1c58876` §3) : une porte qui compare, fichier par
fichier, le nombre de tests courus à celui de la base, et refuse une baisse non déclarée (avec la liste des retraits voulus) ; porteur
RECHERCHES ; déclencheur : avant la G7 de la partie qui suit #246. L'en-tête de l'aide la nomme (l.31-32).

## 5. Tests rouges et verts

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
- Pli, m-1 : pas de test neuf, le test de K16 est `kata_path_is_served` (§7). À `5d430ae9` : 19 sur 19, 12 sur 12, 1 sur 1.
- Pli, m-3 : `served_walk_refuses_an_import_outside_its_closed_list` (l.387-401) : K-hooks, K-worker2 et K-vm2 de la G2, chacun ajouté à
  une copie de `kata-path.ts` ; `forbiddenLoads` ne nomme rien dans la copie, et la marche doit lever avec le seul import hors de la
  liste (`{ actual: [...] }`). À `0fc7fcec`, rouge par `ERR_ASSERTION` (« Missing expected exception: K-hooks: the walk stops on the
  copy ») ; chaque forme mise en tête à la main, rouge de même (« … K-worker2 … », « … K-vm2 … »), octets rendus (sha256 `21245568…`) ;
  19 autres tests verts. À `700b4920` : 20 sur 20, `verifiers-list` 12 sur 12, `every_killer_line_is_readable` 1 sur 1.
- Delta, m-4 : les copies X-execve et X-engine rejoignent `served_walk_refuses_a_load_that_no_specifier_shows` (l.368-369), chacune avec
  le chargement exact que `forbiddenLoads` y nomme. À `2493d1a0`, rouge par `ERR_ASSERTION` sur X-execve (« X-execve: the copy holds the
  load », 19 sur 20) ; à `e79dbc9c`, 20 sur 20. Pas de test neuf : les copies tiennent dans ce test (note 4 de la seconde G2 de delta).

## 6. Tueurs

Déclarés (la ligne au-dessus du test) :
- `apps/harness/test/helpers/import-specifiers.ts:53 CONST "visit(treeOf(text));" -> "found.push(...ts.preProcessFile(text, true, true).importedFiles.map((f) => f.fileName));"` (le scanner à la place de l'arbre)
- `apps/harness/test/helpers/import-specifiers.ts:80 CONST "ts.isStringLiteralLike(n.arguments[0])" -> "true"` (cas servi ; le cas d'aide de 1f garde ce texte)

Dans le corps du test neuf de l'aide, une par ligne neuve : l.36 (`text,` → `"",`), l.40 (`|| ts.isExportDeclaration(n)` retiré), l.41
(`false &&`), l.42 (deux : `ImportKeyword ||` retiré ; `"require"` → `"requires"`), l.43 (`false &&`), l.47 (`[]` → `["./j.ts"]`), l.49
(`undefined`), l.50 (`isStringLiteral`), l.51 (SDL), l.54 (`found.slice(1)`). Dans le corps du cas servi : l.76 (`treeOf("")`) et l.57
(`getBuiltinModule` et `createRequire` retirés de `NAMES`). Lignes sans tueur, de structure seule : l.39, 44, 46, 48, 52, 55.
La ligne `forbiddenLoads` de la marche (`kata-path.test.ts:337`, l.327 au premier pli) est dans un `*.test.ts`, qu'aucun tueur ne vise :
tirée à la main (SDL) à `56b01a79`, le cas servi rougit par `ERR_ASSERTION` (« Missing expected exception: K-calc »), octets restaurés
(sha256 `a1ac638d…`).

Au pli (trois tueurs de `kata-path.ts`, un de `server.ts` ; aucun ne peut viser la marche elle-même, `killerProblem` refusant un
`*.test.ts` : « a killer mutates production code ») :
- `apps/harness/src/server.ts:32 CONST "\"./version.ts\";" -> "\"./version.ts?served\";"` (l.349, dans le corps de
  `kata_path_is_served`) : avec K16, le tueur de la ligne `existsSync` (l.335). `version.ts` est aussi atteint par `openapi.ts` : le
  mutant ne change rien au runtime, la marche seule le voit.
- `apps/harness/src/kata-path.ts:15`, après l'import de `./tools/gate.ts` comme dans la G2 : K-hooks au-dessus du test neuf (l.386),
  K-worker2 et K-vm2 dans son corps (l.394, 395), chacun la forme du test sur une ligne. K-vm2 prend le chemin de la garde par
  `import.meta.dirname` et non par `new URL(…).pathname`, qui rend `/C:/…` sous Windows : `createRequire` le lirait mal et le chargement
  du fichier de test échouerait, pas une assertion. La copie du test garde le texte de la G2, qui n'est que lu.
- Lignes neuves de la marche, sans tueur possible : l.335 (`existsSync`), tirée à la main (§7) ; l.338 (la liste) et la constante
  l.324-325, dont la preuve est le test rouge `0fc7fcec` (la marche sans la liste) et la survie des trois formes, en mutants de
  `kata-path.ts`, à `5d430ae9` (§7). L'en-tête de l'aide et les deux textes de m-2 : commentaires et message, sans tueur.
- Au delta (m-4), deux tueurs de `kata-path.ts:15` dans le corps de `served_walk_refuses_a_load_that_no_specifier_shows` (l.373, l.374) :
  `setEngine` en tête, dans un `try` (le processus survit, la marche le lit) ; `execve` dans une fonction, car un appel au chargement
  remplacerait le processus du test avant la marche (§4, item TEST-COUNT-FLOOR-1). Note 4 de la seconde G2 de delta.

## 7. Preuves

- `verifie-ancres.mjs` (`923db533…`, `--ref 5437cd0d`) : à `5a649d84`, 44 tueurs des deux fichiers touchés, l'arbre entier 1 658 ; à
  `700b4920`, 48 et 1 662 ; tous ANCRE.
- `scripts/mutants/run.mjs --killers --base 5437cd0d` à `56b01a79` (verrou d'hôte partagé, Node 24.21.0) : base 581 verts ; 43 tués sur
  44, dont les 15 neufs. K16, le tueur du tronc de `kata_path_is_served` (`tools/gate.ts:62`, `?served`), y est « non conclu » : son
  premier lancement (le test seul) rougit par `ENOENT`, la marche lisant `kata-path.ts?served`. Le rejeu sur les 53 fichiers cibles est
  noté « tue », mais seulement parce que `served_walk_refuses_a_load_that_no_specifier_shows`, un test de ce lot, y échoue par
  assertion (son `assert.throws` reçoit l'erreur `ENOENT`) ; `kata_path_is_served`, `every_listed_code_has_a_served_thrower_or_is_pending`
  et `entry_points_never_pass_policy_tables` (`gate-kata-served.test.ts`) y rougissent par `ENOENT`, et la ligne reste « non conclu ».
  Ce G0 écrivait « (rejeu : tué) » sans le dire ; la G2 écrit « le rejeu est non conclu », ce que ni son `RESULTS.json` (`11319d30…`)
  ni celui-ci (`850eb2d4…`) ne disent : les deux notent le rejeu « tue », avec ces quatre rouges (par `classify` de red-proof, trois
  `other-fail` à `ENOENT`, un `assert-fail`). Préexistant (même chose au tronc) ; plié ici (m-1).
- Au pli, à `5d430ae9` (`--killers`, même base) : 45 tués sur 45. K16 tué par assertion à son premier lancement (1 rouge,
  `kata_path_is_served` : « …/kata-path.ts?served: a relative specifier that names no file ») ; le tueur neuf `server.ts:32` (K17) tué
  par la même ligne (`kata_path_is_served`, `every_listed_code_has_a_served_thrower_or_is_pending`). `RESULTS.json` `3984d17d…`. Base 575
  verts et non 581 : les trois derniers tests de `test/narabi-live.test.ts` et de `test/spec-1-1-0-release.test.ts` n'ont pas été
  rapportés par leur processus enfant dans ce lancement (les enfants de `run.mjs` tournent sans le préchargement `blocking-stdout` de
  `test:main`) ; aucun rouge.
- À `700b4920` (`--killers`) : base 582 verts (61 fichiers) ; 48 tués sur 48. K16 : 1 rouge, `kata_path_is_served`. K-hooks (K21) :
  1 rouge, le test neuf, dont la copie porte alors deux fois `node:module` ; K-worker2 et K-vm2 (K22, K23) : 3 rouges chacun,
  `kata_path_is_served` et `every_listed_code_has_a_served_thrower_or_is_pending` par l'assertion de la liste sur le vrai `kata-path.ts`
  (« …/kata-path.ts: an import outside SERVED_IMPORTS »), et le test neuf. `RESULTS.json` `567d17f3…`.
- La ligne `existsSync` tirée à la main à `700b4920` (`--killers --only K16,K17`, octets rendus, sha256 `56916991…`) : K16 et K17
  « non conclu », chacun par `ENOENT` à son premier lancement. C'est donc cette ligne qui les fait mourir par assertion.
  `RESULTS.json` `8d0d5b36…`.
- Les trois formes en mutants de `kata-path.ts` à `5d430ae9`, avant la liste (`--table`, lignes tirées des tueurs par `parseKiller`) :
  chacune survit à son premier lancement (50 verts, les trois fichiers qui importent `kata-path.ts`) ; au rejeu sur les 53 fichiers
  cibles, K-worker2 et K-vm2 survivent, et K-hooks rougit 7 entrées d'autres fichiers par son seul effet au runtime : le crochet posé
  renvoie tout import ultérieur de `./version.ts` du processus vers `policy-guard.ts`, d'où 6 échecs de chargement (« does not provide an
  export named 'HARNESS_VERSION' ») et une assertion (`ukemi_in_process_pins_follow_the_pending_snapshot`), aucun par un contrôle des
  imports. `RESULTS.json` `ec8b836b…`. La G2 (`a32ce17e…`) a le même rejeu (7 rouges) et le résume par « survit à toute la suite cible ».
- red-proof, `--base 5437cd0d --gel 56b01a79 --draw 3 --seed 1007` : REFUSED, 2 jugés, 0 tiré, les deux « green at base: a
  self-confirming test » ; `RED-PROOF.json` `d11462b4…`, digest du gel `d58f14e7…`. C'est par construction : le diff ne change aucun
  code de production (`files.production` vide), l'aide est un fichier d'appui sous `test/`, et red-proof le recopie dans la base, où les
  deux tests tournent donc sur l'aide neuve. `--test-only` refuse aussi (« production changed » : un fichier d'appui modifié compte comme
  production ; `RED-PROOF.json` `202c5f11…`). À la place : `e0f45e1f` rouge et `56b01a79` vert (§5) ; les tests de `56b01a79` sur l'aide
  de la base (blob `109ef3bc`, remise en place puis restaurée, sha256 `14d00842…`) : le test neuf de l'aide rougit par `ERR_ASSERTION`,
  les 30 autres restent verts (le cas servi aussi, puisque sa ligne est dans la marche) ; la marche tirée à la main (§6). Au pli, pas
  relancé, pour la même raison : la liste et `existsSync` sont dans la marche, du code de test que red-proof recopie dans la base. À la
  place : `0fc7fcec` rouge, `700b4920` vert (§5), et les mutants ci-dessus.
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

Rejouée au pli dans un worktree jetable (`0e31950b` + `700b4920`, `--no-ff --no-commit`, jamais commitée, worktree retiré) :
- un seul conflit, `apps/harness/test/kata-path.test.ts`, trois blocs (au premier pli, `resolve-a1.mjs`, hors dépôt, `bcde68db…`) : (1) l'import : celui de cette
  branche, `import { forbiddenLoads, importSpecifiers } from "./helpers/import-specifiers.ts";` ; (2) la liste et les commentaires de la
  marche : ceux de cette branche (`SERVED_IMPORTS` et sa doc, qui au delta nomme `execve` et `setEngine`, m-4 ; la signature à `read`), la
  doc de `servedModules` disant, comme a1, que la marche suit « a relative specifier, as importSpecifiers lists it » et, au delta, portant
  la phrase corrigée de m-5 sur le suffixe de requête (au delta, la doc fusionnée est celle de `ast-delta-tools/resolve.mjs`, hors dépôt,
  `8b43918e…`, dont les marqueurs sont écrits pour `e79dbc9c` ; `resolve-a1.mjs` garde l'ancienne incise et s'arrête sur « block 2: our
  doc » dès le delta ; la recette n'a donc plus qu'un script, `resolve.mjs` : m-7 de la seconde G2 de delta) ;
  (3) le corps : les quatre lignes de cette branche (`existsSync`, `read`, `forbiddenLoads`, la liste), puis la boucle d'a1 sur
  `importSpecifiers(text)`, à la place de la regex (`text` et non `readFileSync(file, "utf8")`, pour suivre la copie qu'un test passe) ;
- le tueur d'a1 `import-specifiers.ts:26` (`policy-committed.test.ts:135`) perd sa ligne (`verifie-ancres` : 1 669 tueurs, 1 668 ANCRE,
  1 PERDU) ; même mutation sur la ligne neuve :
  `apps/harness/test/helpers/import-specifiers.ts:50 CONST "ts.isStringLiteralLike(s)" -> "ts.isStringLiteralLike(s) && text[s.getStart()] === '\"'"` ;
  puis 1 669 ANCRE (`--ref 0e31950b --ref 700b4920`) ;
- à cette tête : `policy-committed` 7 sur 7, `kata-path` 20 sur 20, `verifiers-list` 12 sur 12, `killer-lines` 1 sur 1 ; `tsc` 0,
  `eslint` 0 ; la liste ne refuse rien (la marche d'a1, qui suit `importSpecifiers`, n'atteint aucun import hors liste). Plus loin, à
  la tête de #237 (`4da02ad0`), `tools/gate.ts` importe les deux modules neufs d'a1 : 24 modules servis, les mêmes onze noms
  (`policy-committed.ts` n'importe, hors relatifs, que `node:crypto`, `node:fs`, `node:url` et `@monark/contracts`), rien hors liste
  (`served-specs-other.mts`, l'arbre de #237 lu par l'aide de cette branche) ;
- `--table a1-forms.json --killers --base 0e31950b`, un lancement (la table d'a1 de `gen-a1-forms.mjs`, 22 lignes, `e453200c…`) : base
  586 verts ; 77 tués sur 77. Les 22 formes comme au premier passage (G1 à G8 chacune par son test ; R15 à R19, P09 à P11, K04, K05, N07,
  N08 ; **P11** par `forbiddenLoads` ; K04 et K05 par `kata_path_is_served`, la marche suivant `importSpecifiers`) ; les 55 tueurs des
  trois fichiers de test que la fusion change, dont K16 (1 rouge, `kata_path_is_served`), les trois formes de m-3 et le tueur ré-ancré
  d'a1 (`import_specifiers_are_read_in_both_quotes`). `RESULTS.json` `d285e9c0…`.
- Pli de m-6 (seconde marche) à la fusion d'a1 : a1 fait suivre `importSpecifiers` à la première marche, mais laisse la seconde marche
  de `entry_points_never_pass_policy_tables` (`gate-kata-served.test.ts`, l.212-218) sur la regex des guillemets doubles. À ce pli, mettre
  dans cette seconde marche la même boucle qu'a1 met dans `servedModules`
  (`for (const s of importSpecifiers(readFileSync(file, "utf8"))) if (/^\.{1,2}\//.test(s)) walk(join(dirname(file), s));`, l.216, et son
  import ; **+2 −1**), portée par RECHERCHES à ce pli, comme la phrase de `policy-committed.test.ts:22` (§10) ; pas d'item neuf (m-6).
  #237, empilée sur #236, ajoute six imports juste après la l.24 de ce fichier, là où cet import viendrait naturellement (note 7 de la
  seconde G2 de delta) : placé là, la fusion à trois voies du fichier avec celui de la tête de #237 (`4da02ad0`) donne un conflit, trivial ;
  placé après la l.20 (`import { createHarnessHandler } from "../src/server.ts";`), aucun, et la boucle passe à la l.217 (`git merge-file`,
  mesuré au pli de la seconde G2 de delta).
- Rejouée au delta avec la tête `e79dbc9c` (`0e31950b` + `e79dbc9c`, `--no-ff --no-commit`, jamais commitée, worktree retiré) : même
  conflit, trois blocs, résolu par `ast-delta-tools/resolve.mjs` (`8b43918e…`), dont la doc fusionnée de `servedModules` porte la phrase
  corrigée de m-5 ; `verifie-ancres --ref
  0e31950b --ref e79dbc9c` : 1 671 tueurs, 1 670 ANCRE, 1 PERDU (le même, `policy-committed.test.ts:135` → `import-specifiers.ts:26`), puis
  1 671 ANCRE après le ré-ancrage ci-dessus ; `tsc` 0, `eslint` 0, `kata-path` 20/20, `policy-committed` 7/7, `gate-kata-served` 12/12,
  `verifiers-list` 12/12, `killer-lines` 1/1. Les deux tueurs neufs rougissent `kata-path` à la fusion (`execve`, `setEngine` : 4 rouges
  chacun, la marche d'a1 gardant le contrôle `forbiddenLoads`), et le tueur ré-ancré d'a1 rougit `import_specifiers_are_read_in_both_quotes`.
  La campagne `--table a1-forms.json` (77 mutants : 22 formes et 55 tueurs ; note 8 de la seconde G2 de delta) n'a pas été relancée au
  delta (elle tient à `700b4920`, ci-dessus) ; seuls ces trois tueurs ont été tirés à la main.
- Rejouée au pli de la seconde G2 de delta avec la tête `3527f5a1` (`0e31950b` + `3527f5a1`, `--no-ff --no-commit`, jamais commitée, puis
  `merge --abort`, dans un worktree jetable rendu propre) : un seul conflit, `kata-path.test.ts`, aux mêmes octets que ceux de la revue
  (`33cecfdf…`, à l'étiquette des marqueurs près ; l'en-tête de l'aide et ce G0 fusionnent sans conflit). `resolve.mjs` (`8b43918e…`, ses
  marqueurs rendus à `e79dbc9c`) rend `843734ff…`, octet pour octet la résolution que la revue a écrite d'après la seule prose de ce §8 ;
  `resolve-a1.mjs` (`bcde68db…`) s'arrête sur « block 2: our doc » sans rien écrire. `verifie-ancres --ref 0e31950b --ref 3527f5a1` :
  1 671 tueurs, 1 670 ANCRE, 1 PERDU (le même), puis 1 671 ANCRE après le ré-ancrage ci-dessus ; `tsc` 0, `eslint` 0 (quatre fichiers) ;
  `kata-path` 20/20, `policy-committed` 7/7, `verifiers-list` 12/12, `killer-lines` 1/1, `gate-kata-served` 12/12. À la main sur la
  fusion : `setEngine` et `execve` en `kata-path.ts:15` font 4 rouges chacun par `ERR_ASSERTION`, et le tueur ré-ancré d'a1 rougit
  `import_specifiers_are_read_in_both_quotes` par `ERR_ASSERTION`. La recette de m-6 posée (l'import après la l.20, la boucle, **+2 −1**) :
  `gate-kata-served` 12/12, `tsc` 0, `eslint` 0 ; les deux marches ont alors les mêmes racines et la même boucle (note 6 de cette G2).

## 9. Taille et portes

- R-25, forme de la CI (les pathspecs lues dans `ci.yml`), `origin/lot/etude-suite...HEAD` : 3 fichiers, +155 −31, soit **186** (borne de
  lot 547 ; borne ADR 1205 ; 155 au premier pli, 116 avant). La base de fusion reste `5437cd0d` (le tronc a avancé à `e13cfff7` par #244,
  qui ne touche aucun fichier de ce lot), donc `5437cd0d...HEAD` donne le même compte. Ce G0 est hors du compte (`docs/**/*.md`). Le delta
  ajoute +20 −11 au compte R-25 (le diff brut du delta sur le code est de +45 −36 : note 5 de la seconde G2 de delta) : `execve` et
  `setEngine` dans `NAMES`, l'en-tête de l'aide réécrit à nombre de lignes constant (pour qu'aucun tueur ne bouge), les deux copies et les
  deux tueurs neufs de la marche, et la correction de m-5.
- À `700b4920` : `tsc --noEmit` 0 ; `eslint` des trois fichiers 0 ; `gate:vocab` OK (349 fichiers) ; `lang:gate` OK ; `lint:ratchet`
  69/69 ; `export:check` OK ; winlint (`676416fe…`, `--base 5437cd0d`) : 4 fichiers, aucun risque Windows.
- `test:main` (Node 24.21.0, Linux) sur le code de cette tête, `700b4920` (ce G0 ne change que lui ; lancé avec ce G0 en place, sa
  ligne de compte mise à part) : 2 928 tests, 2 906 verts, 0 rouge, 22 sautés, sortie 0 (un test de plus qu'à `5a649d84`, le cas neuf
  de m-3). CI en ligne à `700b4920` : 11 contrôles sur 11 verts ; gates run `37708521007` (7 tâches), `g3-verification` 2 928 tests,
  2 906 passés, 0 échec, 22 sautés ; `r25-taille-de-lot` : « R-25 mode: written », « Changed lines: 155 (ADR bound: 1205) ».
- Avant le pli, à `5a649d84` : 2 927 tests, 2 905 verts, 0 rouge, 22 sautés, sortie 0 (deux tests de plus qu'au tronc), le compte de la
  CI à cette tête (run `37696492908`). Cette ligne citait `75d55651`, la tête locale de ce G0 avant la ligne : un commit jamais poussé,
  au même code.
- Au delta, à `e79dbc9c` (code ; ce G0 suit, hors du compte R-25) : `tsc --noEmit` 0 ; `eslint` des deux fichiers touchés 0 ; `gate:vocab`
  OK (349 fichiers) ; `lang:gate` OK ; `lint:ratchet` 69/69 ; `export:check` OK ; winlint (`676416fe…`, `--base 5437cd0d`) : 4 fichiers,
  aucun risque Windows. `verifie-ancres` (`--ref 5437cd0d`) : 50 tueurs des fichiers touchés et 1 664 sur l'arbre, tous ANCRE (48 et 1 662
  au premier pli, +2 pour les deux tueurs neufs). `run.mjs --killers --base 5437cd0d` : base 582 verts, **50 tués sur 50** par assertion
  (`RESULTS.json` `89df5d77…`), dont les cinq tueurs de `kata-path.ts:15` (K21–K25), les deux neufs (`execve`, `setEngine`) compris.
  red-proof (`--base 2bb118a6 --gel e79dbc9c --draw 2`) : REFUSED, « green at base: a self-confirming test » (`RED-PROOF.json`
  `81840ab5…`), par construction, la correction étant dans l'aide, du code de test que red-proof recopie dans la base ; la preuve
  rouge-vert est la séquence des commits (`2493d1a0` : `served_walk_refuses_a_load_that_no_specifier_shows` rouge par `ERR_ASSERTION`
  sur X-execve, 19 sur 20 ; `e79dbc9c` : 20 sur 20).
- CI en ligne à `e79dbc9c` : 11 contrôles sur 11 verts ; gates run `37721031439` (7 tâches), `g3-verification` 2 929 tests, 2 907 passés,
  0 échec, 0 annulé, 22 sautés ; `r25-taille-de-lot` : « R-25 mode: written », « Changed lines: 186 (ADR bound: 1205) » ; CodeQL (les
  trois analyses et le contrôle CodeQL) verts. Le compte de la suite est un de plus qu'au premier pli (2 928) : la réf de fusion de la PR
  prend désormais le tronc `e13cfff7`, qui porte les tests de #244 ; ce lot n'ajoute aucun test (les copies tiennent dans un test existant).
- Au pli de la seconde G2 de delta, à `3527f5a1` (l'en-tête de l'aide seul ; ce G0 suit, hors du compte R-25) : R-25 inchangé, **186**
  (3 fichiers, +155 −31, `origin/lot/etude-suite...HEAD` avec le tronc `43f46d9f`, base de fusion `5437cd0d` ; le diff du pli est de +6 −6,
  l'en-tête gagnant une ligne et la ligne vide après l'import en perdant une). `tsc --noEmit` 0 ; `eslint` de l'aide 0 ; `gate:vocab` OK
  (349 fichiers) ; `lang:gate` OK ; `lint:ratchet` 69/69 ; `export:check` OK ; winlint (`676416fe…`, `--base 5437cd0d`) : 4 fichiers, aucun
  risque Windows. `verifie-ancres` : 50 tueurs des fichiers touchés, tous ANCRE contre `5437cd0d` comme contre `536f04c2` (aucune ligne
  visée n'a bougé), et 1 664 sur l'arbre ; `every_killer_line_is_readable` 1/1 ; `kata-path` 20/20, `verifiers-list` 12/12,
  `gate-kata-served` 12/12. `run.mjs --killers --base 5437cd0d` (verrou d'hôte partagé, Node 24.21.0, de 04:36:41Z à 04:39:32Z) : base 577
  verts sur 61 fichiers (les cinq derniers tests de `gate.test.ts` non rapportés par leur enfant, le phénomène du §7) ; **50 tués sur 50**
  à leur premier lancement, chaque TAP ne portant que `ERR_ASSERTION` (`RESULTS.json` `2ed1c149…`, `tool_sha256` `13b2b11f…`). CI en
  ligne à `3527f5a1` : 12 contrôles sur 12 verts (le tronc y ajoute `g3-verifier-tool`, #247) ; gates run `37728291005` (`head_sha`
  vérifié), `g3-verification` 2 935 tests, 2 913 passés, 0 échec, 0 annulé, 22 sautés (les six de plus sont ceux de #247, que la réf de
  fusion prend avec le tronc `43f46d9f`) ; `r25-taille-de-lot` : « R-25 mode: written », « Changed lines: 186 (ADR bound: 1205) » ;
  CodeQL (run `37728287600` : les trois analyses et le contrôle CodeQL) vert.

## 10. Ce qui n'est pas fait

- Windows : rejoué par MONARK à la fusion (dont les tueurs du pli, les deux neufs du delta — `execve` et `setEngine` — et m-4).
- La marche servie ne suit pas encore ses spécificateurs par `importSpecifiers` : c'est le changement d'a1 (#233), §4 et §8.
- À corriger au pli d'a1, pas ici : les corps de #233 et #236 et leurs G0 §8 (« re-exports »), et la phrase de
  `apps/harness/test/policy-committed.test.ts:22` (« its specifiers as importSpecifiers lists them (ts.preProcessFile; servedModules
  follows the same) »), que la fusion garde telle quelle.
- La seconde marche, de `apps/harness/test/gate-kata-served.test.ts:212-218` (`entry_points_never_pass_policy_tables`), suit encore la
  regex des guillemets doubles et lit par `readFileSync` ; ni ce lot, ni a1, ni #237 ne la touchent. Pour la liste fermée elle est
  couverte (même graphe, même regex que `servedModules` à cette tête, qui affirme `existsSync`, `forbiddenLoads` et la liste sur chaque
  module) ; mais sa propre propriété (seul `tools/gate.ts` nomme `policyTables`) garde, après la fusion d'a1, l'angle mort K04/K05 que la
  première marche perd, car a1 ne fait suivre `importSpecifiers` qu'à la première. La fusion du tronc dans a1 (#233/#236) donne à cette
  seconde marche la même boucle `importSpecifiers` (§8, **+2 −1**), portée par RECHERCHES à ce pli, comme la phrase de
  `policy-committed.test.ts:22` ci-dessus ; pas d'item neuf (constat m-6 du delta).
- Non essayé : `import source` (TypeScript 6.0.3 ne le lit pas) ; un texte que l'analyseur de TypeScript et le retrait des types de Node
  liraient autrement ; `ShadowRealm` (absent de Node 24.21 sans drapeau). `process.execve` et `setEngine` de `node:crypto`, cités comme
  non essayés au premier pli parce qu'ils ne passent par aucun import que la liste refuse, sont désormais nommés par `forbiddenLoads` (pli
  de m-4, §4) ; `node:inspector` et `run()` de `node:test` passent par leur import, hors de la liste.
- Un `execve` appelé au chargement d'un module que charge un fichier de test, ou un `process.exit(0)` au chargement : le processus de ce
  fichier est remplacé ou fini avant ses tests, et le lanceur compte le fichier pour une seule entrée verte. Pour la marche, cela vaut des
  12 modules servis que `kata-path.test.ts` charge lui-même (§4, mesuré au §13) ; le tueur de `execve` est donc dans une fonction. Rien dans
  ce lot ne borne ce nombre ; la limite est nommée au §4, dans l'en-tête de l'aide (l.31-32) et dans le corps, et couverte comme classe par
  l'item neuf TEST-COUNT-FLOOR-1 (MONARK, `1c58876` §3 ; porteur RECHERCHES ; déclencheur : avant la G7 de la partie qui suit #246).

## 11. Pli de la G2

| constat | pli |
|---|---|
| m-1 : K16 mourait par `ENOENT` dans la marche que ce lot réécrit | `5d430ae9` : `existsSync` avant la lecture (l.335) et son import (l.10) ; K16 tué par assertion ; tueur neuf `server.ts:32` ; l'histoire de K16 (§7) et le sha poussé (§9) corrigés |
| m-2 : deux textes de `test/verifiers-list.test.ts` nommaient encore `ts.preProcessFile` | `5d430ae9` : l.204 « importSpecifiers (read on the syntax tree) lists them » ; l.216 « as importSpecifiers lists them on the syntax tree » ; la phrase de `policy-committed.test.ts:22` d'a1 rejoint le pli d'a1 (§10) |
| m-3 : un module servi qui importe un chargeur de Node passait la marche | voie (a) de MONARK (`1696708`) : `0fc7fcec` (le test rouge, les trois formes de la G2), `700b4920` (`SERVED_IMPORTS` et son assertion, trois tueurs, l'en-tête) ; §4 à §8 |

Artefacts du pli, hors dépôt : `scratchpad/ast-fold/` (scripts, tables, `RESULTS.json` cités, sorties TAP ; `SHA256SUMS.txt`).

Notes de la G2 non pliées : l'en-tête dit « the one tree that forbiddenLoads walks too » alors que chaque lecteur appelle `treeOf` pour
lui (formulation, pas un défaut) ; le verrou d'hôte de `run.mjs` est pris, ici aussi, dans `scratchpad/F:/tmp`.

## 12. Pli du delta (m-4, m-5, m-6)

| constat | pli |
|---|---|
| m-4 : deux chargeurs qu'aucun import ne refuse (`process.execve`, `setEngine` de `node:crypto`) et une troisième voie (`Function` par énumération des descripteurs d'un prototype) passaient la marche sans être nommés | voie (a) : `2493d1a0` (test rouge — les copies X-execve et X-engine, et deux tueurs de `kata-path.ts` : `setEngine` en tête, `execve` dans une fonction), `e79dbc9c` (`execve` et `setEngine` dans `NAMES`, l'en-tête élargi). `Function` par énumération nommé sous IMPORT-AST-RUNTIME-NAME-1, dont le G0 élargit le texte à « a loader or constructor reached by a name built or chosen at run time » (à relayer à MONARK pour l'ETAT). En-tête de l'aide, doc de `SERVED_IMPORTS`, §4 et §10 mis à jour ; §9 : 50 tueurs sur 50, 1 664 ANCRE, R-25 186 |
| m-5 : « un suffixe de requête que Node charge comme le même module » est faux | `2493d1a0` (doc de `servedModules`), ce G0 (§4, la doc fusionnée du §8), et le corps de la PR : avec un suffixe comme `?served`, Node 24 réévalue le même fichier une seconde fois comme une autre instance de module ; la marche affirme seulement que le spécificateur relatif nomme un fichier |
| m-6 : la seconde marche (`gate-kata-served.test.ts:212-218`), couverte pour la liste mais laissée sans item, divergera de la première à la fusion d'a1 | aucun changement dans cette PR : la fusion d'a1 (#233/#236) lui donne la même boucle `importSpecifiers` (+2 −1), portée par RECHERCHES à ce pli, écrit au §8 (recette) et au §10 ; pas d'item neuf |

Artefacts du pli du delta, hors dépôt : `scratchpad/ad-mut-killers/` (`--killers`, `RESULTS.json` `89df5d77…`), `scratchpad/ad-redproof/`
(`RED-PROOF.json` `81840ab5…`), la fusion d'a1 rejouée (`0e31950b` + `e79dbc9c`, jamais commitée, worktree retiré), résolue par
`scratchpad/ast-delta-tools/resolve.mjs` (`8b43918e…`, m-7 de la seconde G2 de delta).

## 13. Pli de la seconde G2 de delta (m-7, m-8, note 2)

| constat | pli |
|---|---|
| m-7 : le §8 disait la doc fusionnée corrigée portée par `resolve-a1.mjs`, qui garde l'ancienne incise, et ne nommait pas le script qui a résolu le delta | ce G0 : le §8 (premier pli, doc fusionnée, rejeu du delta) et le §12 nomment `scratchpad/ast-delta-tools/resolve.mjs` (`8b43918e…`), désormais le seul script de la recette ; `resolve-a1.mjs` (`bcde68db…`) est celui du premier pli. Rejoué à `3527f5a1` (§8) : `resolve.mjs` rend `843734ff…`, la résolution que la revue a écrite d'après la prose du §8 ; `resolve-a1.mjs` s'arrête sur « block 2: our doc » |
| m-8 : la limite d'un `execve` appelé au chargement n'était écrite qu'au-dessus des tueurs | voie (a), décidée par MONARK (`1c58876` §2) : `3527f5a1` (l'en-tête de l'aide, l.31-32 ; le paragraphe de la limite au-dessus rendu au mot près, et la ligne vide après l'import ôtée, pour qu'aucune ligne de code ne bouge), ce G0 (§4, §6, §10), une phrase du corps ; couverte comme classe par l'item neuf TEST-COUNT-FLOOR-1 (§4) |
| note 2 : le corps disait « the known limit of reading a loader whose name is built or chosen at run time » | le corps prend le libellé décidé : « a loader or constructor reached by a name built or chosen at run time » ; il dit aussi, note 3, « outside the helper and its tests » |

La limite mesurée, à `3527f5a1`, par des mutants à la main dans un worktree jetable (octets rendus, sha256 vérifié, `git status` vide
après chacun ; Node 24.21.0, les drapeaux du script `test` du dépôt) :
- un `execve` appelé au chargement de `kata-path.ts`, l'un des 12 modules servis que charge `kata-path.test.ts` : `kata-path.test.ts` rend
  « tests 1, pass 1 », sortie 0, au lieu de ses 20 tests, la marche n'ayant pas tourné ; de même `gate-kata-served.test.ts` (1 entrée
  verte au lieu de 12) ;
- le même appel au chargement de `version.ts`, l'un des 10 autres : `kata-path.test.ts` rougit par `ERR_ASSERTION`
  (`kata_path_is_served` et `every_listed_code_has_a_served_thrower_or_is_pending`, sur `version.ts` ; 18 verts) ;
- un `process.exit(0)` au chargement de `kata-path.ts` : « tests 1, pass 1 », sortie 0.

Le compte de 12 sur 22 : un crochet de chargement (`registerHooks`, préchargé par `--import`) sur `kata-path.test.ts` note 16 modules de
`apps/harness/src`, dont 12 servis, et la fermeture statique du fichier par `importSpecifiers` donne les mêmes (aucun écart). Les notes 3
à 8 de la G2 sont pliées dans ce G0 : §4 (note 3), §5, §6 et §12 (note 4), §9 (note 5), §8 (notes 6, 7 et 8).

Artefacts du pli, hors dépôt (`SHA256SUMS.txt` dans `scratchpad/fold246-m78-out/`) : `scratchpad/fold246-m78-out/mut-killers/`
(`RESULTS.json` `2ed1c149…`), `hand/` (les trois mutants de la limite), `merge/` (octets en conflit `05bd1fd2…`, résolution `843734ff…`,
ancres avant `89074d19…` et après `a0f508b5…`, les tueurs tirés à la main, la recette de m-6 et sa fusion avec #237), `kata-loads.log`
(`a03f79a6…`) ; les outils dans `scratchpad/fold246-m78-tools/` (`tt.sh`, `hand.mjs`, `loadlog.mjs`, `served-closure.mts`, `hdrwrap.mjs`,
`apply-header.mjs`).
