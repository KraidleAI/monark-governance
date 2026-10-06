# G2 du lot L2-KEEP-CAUSE-REST-1 : revue adverse

- **Objet** : `git diff ec0e023d..130fa7aa`, branche `recherches/l2-keep-cause-rest-1`, worktree `/home/user/monark-governance-kcr`.
- **Lus d abord** : `docs/G0-lot-l2-keep-cause-rest-1.md`, `docs/G7-lot-l2-keep-cause-rest-1.md`.
- **Hôte** : Linux, 4 cœurs, Node 24.21.0, proxys retirés pour les commandes de test seulement, `TMPDIR` privé sous `scratchpad/g2kcr/`. Mutations faites dans une copie (`scratchpad/g2kcr/copy`, `node_modules` en lien), jamais dans le worktree.
- **Worktree** : intact. `git status --short` vide, tête `130fa7aa`, sha256 des 2 271 fichiers suivis identique avant et après (`sha256sum -c`).

## Verdict : **non bloquant**

Aucun B. Deux N (oracle et documentation), quatre M. Le lot fait ce qu il dit. Aucun test ne s exécute avant le piège, aucun accès réseau n a été observé, aucune fuite, et les comptes du G0 et du G7 sont exacts.

## 1. Vérifications faites

### 1.1 `before()` racine exécuté à l enregistrement : **vrai**, et le correctif n en dépend pas

- **Sonde** (`scratchpad/g2kcr/probe1.mjs`) : `let flag=false; before(() => { flag = true; });`, puis lecture sur la ligne suivante. On obtient `flag=true` en direct, en `NODE_TEST_CONTEXT=child-v8`, sous `node --test` et sous `--test-isolation=none`. Un `before` **asynchrone** exécute son corps jusqu au premier `await` seulement : la suite vient au microtâche suivant. Un `before` placé dans un `describe` n est **pas** exécuté à l enregistrement.
- **Source** (`node --expose-internals`, `Test.prototype.createHook`) : `if (name === 'before' && this.startTime !== null) { // Test has already started, run the hook immediately`. La racine est démarrée dès la création du harnais : le comportement est voulu, pas un accident de minutage.
- **Une seule exécution, attendue par les tests** (`probe2.mjs`) : un `before` racine asynchrone de 300 ms. Le test `a` voit `ready === true`, et `n === 1` pour les deux tests. `runOnce` rend la même promesse, que chaque sous-test attend.
- **Fragilité** : nulle pour ce lot. `REAL` est lu **avant** l appel de `before` dans `l2-rest-tls` (l. 21 puis l. 22). Si une version future différait le crochet jusqu au premier test, l ordre resterait juste : `REAL` est lu en premier et les tests attendent le crochet. Si elle l exécutait aussitôt, comme aujourd hui, l ordre est aussi juste. Seule la forme du compte `tests begun 0, ended N` dépend de la version (voir M-1, déjà au G7).

### 1.2 Piège et réseau : **aucun test ne tourne sans piège**

- **Exécution normale** : `trap()` est synchrone et s exécute pendant l évaluation du module, avant tout `test()`. Aucun code de chargement placé après le crochet ne touche au réseau, dans aucun des 3 fichiers à piège.
- **Piège en échec, sonde espion** (`scratchpad/g2kcr/spy.mjs`, préchargé par `--import`) :
  - le setter de `fetch` lève `INJECTED at trap` ;
  - le getter rend un `fetch` réel instrumenté qui écrit sur fd 1 ;
  - `net.Socket.prototype.connect` et `fs.mkdtempSync` sont instrumentés de même.

  Résultat sur `l2-rest`, `l2-rest-tls` et `l2-fake-place` : **0 appel au `fetch` réel, 0 `connect`, 0 `mkdtemp`**. Les rouges valent 13/13, 3/3 et 8/8, et `pass 0`. Aucun corps de test ne s exécute quand le crochet lève. Pourtant, dans ce cas, `WebSocket` n est pas piégé (`trap()` lève avant sa 2e affectation, `test/l2-fake-place.ts:131-132`). Cela reste sans effet, puisque rien ne tourne.
- **Observation hors lot** (déjà vraie à la base) : avec `before(() => {})`, c est-à-dire sans `trap()` du tout, `l2-rest` reste vert 13/13 et `l2-rest-tls` reste vert 3/3. Seul `l2-fake-place` rougit (7/8). Les propres tests de ces deux fichiers ne prouvent pas le piège. Le lot améliore ce point : les nouveaux tests de `keep-cause.test.ts` rougissent si le fichier n affecte plus `globalThis.fetch`.

### 1.3 Crochets `before` et `after`, fuites

- `l2-segments.test.ts:17-18` : `ROOT = ""` reste vide si `mkdtempSync` lève, et `after` saute alors le `rmSync`. Aucun appel `rmSync("")` n est possible. `ROOT` ne sert qu à l intérieur des tests (l. 27 et 104), jamais au chargement. Comme aucun test ne tourne si le crochet lève, `openWriter(ROOT, "../x")` ne peut pas viser le dossier courant.
- `l2-rest-tls` : `after` vide `sockets`, `servers` et `outs`. Ces tableaux sont vides si `trap()` lève.
- **Aucune FIFO** dans les fichiers touchés. Les seuls processus enfants sont les `spawnSync` de `keep-cause.test.ts:67`, avec un `timeout` de 120 s.
- **`TMPDIR` privé vide** après tous les passages : 222 tests, 2 × 60 en charge, 96 plantages injectés.

### 1.4 Tueurs tirés à la main (copie, sha256 restauré à chaque fois)

| Mutation déclarée | Tests rouges (sur 11) |
|---|---|
| `keep-cause.ts:31 "ended = 0" -> "ended = 1"` | les **4 nouveaux** + 4 anciens (`an_exit_inside…`, `l2_book_*` ×2, `names_the_test…`) |
| `keep-cause.ts:38 "ended ${String(ended)}" -> "ended ${String(begun)}"` | les **4 nouveaux** + 3 anciens |
| `keep-cause.ts:33 "step = \"between tests\"" -> "void 0"` | les **4 nouveaux** + 2 anciens |
| `keep-cause.ts:38 "${file}: exit code" -> "exit code"` | les **4 nouveaux** + 4 anciens |

Chaque tueur est réel, mais aucun ne distingue un fichier d un autre (voir N-1).

**Contrôles par fichier** (la vraie modification du lot, hors convention) : rouge ciblé dans 11 cas sur 11.
- `keepCause(…)` retiré : 4 cas sur 4.
- Le travail remis au chargement (`trap();` ou `const ROOT = mkdtempSync(…)`) : 4 cas sur 4.
- `before(() => {})` sans piège : 3 cas sur 3.

Dans tous ces cas, le propre fichier reste vert, sauf `l2-fake-place` sans piège.

**À la base**, avec le nouveau `keep-cause.test.ts` : les 4 nouveaux tests sont rouges, avec `actual: [ 1, [], false ]` à chaque fois, ce qui est conforme au G0 et au G7.

**Précision de l assertion** : `deepEqual` sur trois valeurs, l exit, la ligne exacte (fichier, code, étape et comptes) et la présence de la cause. La cause apparaît 52, 12, 32 et 24 fois dans le stdout de l enfant, soit 4 fois par test rouge. Une variante où le crochet relance une autre erreur (`throw new Error("other")`) rougit bien le test : la cause est donc vérifiée, pas seulement l exit.

### 1.5 Charge

- **12 en parallèle, 2 tours, fichier par fichier** (`keep-cause` et les 4 fichiers) : 24/24 verts par fichier, aucune ligne `# keep-cause`.
- **Mélangé**, 60 processus simultanés (12 × 5 fichiers), 2 tours : 24/24 verts par fichier.
- **Plantage injecté sous charge, stderr jeté** (`node --test --import=<faute> <fichier> 2>/dev/null`), 12 × 4 fichiers simultanés, 2 tours :
  - la ligne `# keep-cause test/<f>.test.ts: exit code 1 during between tests, tests begun 0, ended N` est présente **24/24** pour chacun des 4 fichiers ;
  - `INJECTED at` est présent 24/24 ;
  - `ℹ fail` vaut 13, 3, 8 et 6 dans tous les cas.

  C est la preuve directe de la promesse du lot.
- **Réserve** : un autre `node --test` (`dojo-*`, `lot-retire`, d une autre session) tournait sur la machine pendant ces mesures. La charge réelle était donc plus forte, pas plus faible.
- **Suite complète** : `node --test test/l2-*.test.ts test/keep-cause.test.ts` donne 222/222, ce qui est conforme au G7.

### 1.6 Windows

- Les chemins sont faits par `fileURLToPath(new URL(…))`, `join(tmpdir(), …)` et `pathToFileURL(pre).href` pour `--import`, le même chemin que les tests `l2-book` déjà verts sous Windows.
- Aucun nom réservé, aucun saut `win32`, aucune barre oblique codée en dur dans un chemin du système de fichiers.
- `rmSync` utilise `maxRetries: 5, retryDelay: 100` dans `l2-segments`, ce qui vaut mieux que le `maxRetries: 3` de la base pour les verrous Windows.

### 1.7 Accord entre le G0, le G7 et le code

- **Lignes** : 348, 140, 130 et 207, identiques à la base. Les lignes `// killer:` et `test(` gardent leurs numéros dans les 4 fichiers (comparaison faite par `grep -n`).
- **Tests** : 13, 3, 8 et 6.
- **Numéros de ligne** : l import de `before` (l. 5, 6, 6, 6), l import du témoin (l. 14, 19, 9, 14), `keepCause` (l. 15, 20, 10, 16), `REAL` (l. 21) et le crochet de `l2-rest-tls` (l. 22) sont exacts.
- **R-25** : `--numstat` donne +51/−19 sur les tests, soit 70 lignes, ce qui est exact.
- **Commits** : les 7 commits cités au G7 existent, dans cet ordre.
- **Couverture** : les 12 fichiers `test/l2-*.test.ts` appellent `keepCause(`.

## 2. Constats

### N-1 : les tueurs déclarés ne lient aucun test à son fichier

- **Où** : `test/keep-cause.test.ts:97, 102, 107, 112`, et le G0, section « Tueurs ».
- **Constat** : chacun des 4 tueurs vise `test/helpers/keep-cause.ts`, et chacun rougit **les 4** nouveaux tests ainsi que 2 à 4 anciens. L association d un tueur à un test (« `_l2_rest_` ← ligne 31 ») est donc arbitraire. Le red-proof `--test-only` dit « 4 tueurs tués » sans prouver que chaque test garde son fichier. Ce que le lot change vraiment, `keepCause` et `before` dans chaque fichier, n est prouvé que par les 8 contrôles manuels du G7. Ces contrôles ont été refaits ici, et ils tiennent.
- **Reproduction** : appliquer n importe laquelle des 4 mutations du G0 dans une copie, puis lancer `node --test test/keep-cause.test.ts`. Les 4 tests `keep_cause_l2_{rest,rest_tls,fake_place,segments}_*` sont tous rouges.
- **Correctif** : dire au G0 et au G7, à la section Oracle, que les tueurs déclarés prouvent le support et non le câblage de chaque fichier, et que le câblage est prouvé par les contrôles manuels, listés et reproductibles. **Taille** : 2 à 3 lignes de documentation. Un tueur par fichier exigerait d assouplir la convention de `scripts/red-proof.mjs`, qui interdit un tueur dans un `*.test.ts` : hors lot.

### N-2 : le G7 décrit l écart de `l2-rest-tls` comme une cause « mesurée », sans citer la source

- **Où** : `docs/G7-lot-l2-keep-cause-rest-1.md`, section « Écart trouvé », puce « Cause, mesurée ».
- **Constat** : le comportement est documenté dans le code de Node (`createHook` : `// Test has already started, run the hook immediately`). Il est aussi limité :
  - seul un `before` **racine** est concerné, pas celui d un `describe` ;
  - pour un crochet asynchrone, seule la partie qui précède le premier `await` s exécute à l enregistrement.

  La règle 3 du G0 et la limite « Lecture après le crochet » du G7 généralisent sans ces deux nuances. Un futur auteur qui ferait `before(async () => { await x; trap(); })` croirait le piège posé au chargement, alors qu il ne l est qu après un microtâche. Ce n est pas dangereux pour les tests, qui attendent le crochet, mais c est faux pour une lecture de global placée juste après.
- **Reproduction** : `scratchpad/g2kcr/probe1.mjs`, sous Node 24.21.0. On lit `async hook body done on next line=false`, puis `describe-level before ran at once=false`.
- **Correctif** : une phrase au G0 (règle 3) et au G7 (« Portée ») : « `before` racine, synchrone jusqu à son premier `await` (`createHook`, `startTime !== null`) ». **Taille** : 2 lignes de documentation.

### M-1 : l étape « between tests » est figée pour un échec de crochet `before`

- **Où** : `test/keep-cause.test.ts:96` (`named`), et `test/helpers/keep-cause.ts:33`.
- **Constat** : l échec a lieu dans le `before` racine, au chargement, avant tout test. La ligne dit pourtant `during between tests, tests begun 0, ended N`, parce que `afterEach` tourne pour chaque test qui n a jamais commencé. Les 4 tests figent cette forme, qui dépend de Node 24.21.0. Le G7 le dit déjà (« Comptes figés », N-2 du G2 de #174).
- **Reproduction** : section 1.5, ligne `# keep-cause` du plantage injecté.
- **Correctif** : aucun dans ce lot. Le noter dans l item ORACLE-CHILD-EXIT-TRACE-1, ou un item du témoin, pour une étape `before` distincte. **Taille** : 0 dans ce lot.

### M-2 : le crochet de `l2-rest-tls` est caché en fin de ligne

- **Où** : `test/l2-rest-tls.test.ts:22`.
- **Constat** : `before(() => { trap(); })` est accolé à la déclaration de `outs`, `servers` et `sockets` pour garder le nombre de lignes. L invariant « `REAL` lu avant le crochet » ne tient qu à l ordre de deux lignes, et un reformatage pourrait le casser sans bruit. Il serait vu, cela dit : le G7 a montré 36 rouges sur 36 dans ce cas.
- **Correctif** : facultatif. Garder la forme, ou ajouter `// after REAL (l. 21)` au commentaire de la l. 22. **Taille** : 1 commentaire.

### M-3 : `runBook` porte encore le nom du seul `l2-book`

- **Où** : `test/keep-cause.test.ts:63-64`.
- **Constat** : la fonction prend maintenant n importe quel fichier, mais son nom et sa documentation (`` `file` (test/l2-book.test.ts) ``) parlent de `l2-book`.
- **Correctif** : la renommer `runFile` et préciser « défaut : test/l2-book.test.ts ». **Taille** : 4 lignes.

### M-4 : la cause est vérifiée par sa présence, pas par test

- **Où** : `test/keep-cause.test.ts:93` (`r.out.includes(cause)`).
- **Constat** : le message des tests dit « thirteen named reds carrying the cause ». L assertion prouve seulement que la cause apparaît au moins une fois, et que N tests ont fini, par `ended N`. La mesure donne 4 occurrences par test rouge (52, 12, 32, 24).
- **Correctif** : facultatif, compter les occurrences et les comparer à `≥ n`. **Taille** : 1 ligne. Ce compte dépendrait du format de sérialisation de Node, ce qui est discutable. Le statu quo est acceptable.

## 3. Résumé

Le constat de l auteur sur `before()` est exact, et son correctif est robuste dans les deux sémantiques possibles. Aucun test ne s exécute sans piège, et aucun réseau n est touché quand le piège lève. Les crochets sont bien appariés, sans fuite. La cause passe sur stdout avec stderr jeté, 96 fois sur 96 sous charge. Le G0, le G7 et le code sont d accord. Les réserves portent sur l oracle (N-1) et sur la précision de la documentation (N-2) : **non bloquant**.
