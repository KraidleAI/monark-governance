# G0 du lot UKEMI-CONC-POOL-FLAKE-1 : l'ordre du test d'arrêt du pool, fixé par des verrous et non par des durées

effort: max (passé par l'orchestrateur de RECHERCHES) ; horloge lue à 13:28 UTC le 2026-10-07 (`date -u`) ; pli de la G2 : horloge
lue à 16:04 UTC le 2026-10-07.

- **Demande** : item `UKEMI-CONC-POOL-FLAKE-1`, accordé par MONARK (recherches `2e1d468`,
  `2026-10-07-MONARK-vers-RECHERCHES-a2-i-pliee.md`) : une PR courte, test seul ; l'ordre devient déterministe, sans dépendre des
  frontières de milliseconde ; la variante forcée (attente active de 1,5 ms) rougit 10 fois sur 10 à la base et passe 10 fois sur 10
  après. Le test `ukemi_conc_pool_first_error_stops_dispatch_and_drains_before_rethrow` (`apps/sentinel/test/ukemi-conc.test.ts:95`
  à la base) a rougi en CI sur `f0933604` (#237) : assertion l.109, éléments lancés `[0..5]` au lieu de `[0..7]`.
- **Base** : `102b44d3` (`origin/lot/etude-suite`), branche `recherches/ukemi-conc-pool-order`. Auteur : RECHERCHES. Les mesures
  du G0 ont été prises sur la base précédente, `6a1b1d43` : `apps/sentinel/` et `packages/` y sont identiques
  (`git diff 6a1b1d43 102b44d3 -- apps/sentinel packages` est vide). Celles du pli de la G2, sur `102b44d3`.
- **Zone** : `apps/sentinel/test/ukemi-conc.test.ts` (le seul test nommé ci-dessus) ; ce G0. Aucun code de production :
  `apps/sentinel/src/ukemi/pool.ts` est inchangé (sha256 `2119cfd0…`). L'ETAT ne porte pas de ligne pour cet item : la ligne est
  donnée à MONARK, qui la pose.
- **G2** : MONARK, instance neuve sous Windows 10 (recherches `7d70638`, `2026-10-07-MONARK-vers-RECHERCHES-g2-240.md`, pièce
  `G2-240.json` sha256 `2b5ce8ca…`) : CORRECTIONS, deux M et deux m, pliées par `9b797c66` (le test) et par ce G0 (section « G2 »,
  plus bas). Le gel du pli est `9b797c66` pour le test.

red-proof: test-only

## Constat

Le pool fait ce que dit son contrat (`pool.ts:1-11`) ; c'est l'ordre du test, réglé par des durées, qui dépend de l'horloge.

1. Les éléments 0 à 3 arment chacun une minuterie de 40 ms, l'un après l'autre dans le même tour ; 5 arme une minuterie de 1 ms,
   4, 6 et 7 des minuteries de 40 ms. Node date chaque minuterie d'une lecture neuve de l'horloge de la boucle, à la milliseconde
   (`insert(item, msecs, start = binding.getLibuvNow())`, `lib/internal/timers.js`, lu dans Node 24.21.0).
2. **La règle est un ordre : l'échéance, puis l'id de la liste.** Les minuteries d'une même durée forment une liste ; Node lance les
   listes échues par échéance croissante et, à échéance égale, par id croissant (`compareTimersLists`, l.507-512 : `a.id - b.id`).
   Une liste prend un id neuf à sa création (`TimersList`, l.310 : `this.id = timerListId++`) et à chaque réarmement, quand la
   minuterie suivante de la liste n'est pas encore échue (`listOnTimeout`, l.635-637). Une liste lancée exécute toutes ses
   minuteries échues ; les microtâches passent (`runNextTicks()`, l.644) avant chacune sauf la première, mais après son test
   d'échéance. La voie de 1 n'arme donc 5 que dans les microtâches qui suivent le rappel de 1. Deux modes, selon ce qui est échu
   quand 0 et 1 le sont :
   - **2 et 3 en retard**, armés dans la même ms (l'écart tombe entre 1 et 2) : le test d'échéance de 2 échoue juste après le
     rappel de 1, avant toute microtâche ; la liste de 40 ms est réarmée avant que la voie de 1 n'arme 5. La liste de 1 ms naît
     après, avec l'id le plus grand : à échéance égale, 2 et 3 passent d'abord.
   - **Seul 3 en retard** (l'écart tombe entre 2 et 3) : 2 est échu, donc les microtâches passent avant son rappel, et la voie de 1
     arme 5 ; la liste de 1 ms naît avant que le test d'échéance de 3 n'échoue et ne réarme la liste de 40 ms, qui prend un id plus
     grand. À échéance égale, 5 passe d'abord.
3. Soit d l'écart, en millisecondes de la boucle, entre l'armement de 1 et celui de 3, et L le retard, en ms, de l'armement de 5
   sur l'échéance de 1. La liste de 5 échoit L + 1 ms après l'échéance de 1, celle de 3 d ms après. Rouge si et seulement si la
   liste de 5 passe avant celle de 3 dans l'ordre (échéance, puis id) : 5 échoue et arrête le pool avant que 3 ne parte, et la voie
   de 3 ne lance pas 7.
   - 2 et 3 en retard : 6 ne part pas non plus, `[0..5]`, la sortie de CI. L'égalité va à la liste de 40 ms : rouge si et seulement
     si d ≥ L + 2.
   - Seul 3 en retard : `[0..6]`. L'égalité va à la liste de 1 ms : rouge si et seulement si d ≥ L + 1 ; une seule frontière de ms
     entre 2 et 3, avec un réveil à l'heure (L = 0), suffit.
   - Hors de ces deux modes : si 3 est déjà échu avec 0 et 1, vert. Si 2 et 3 sont en retard dans deux ms distinctes, un second
     réveil entre en jeu, que la règle à deux modes ne décrit pas (6 courses sur 160 au balayage du point 5).
4. **Précision sur la cause donnée par RECHERCHES** (recherches `1f2b02c`), bornée à la G2 : pour la sortie de CI `[0..5]`, un écart
   de 1 ms, une seule frontière franchie, ne suffit pas ; c'est une égalité que 2 et 3 gagnent. Il y faut un écart d'au moins L + 2
   ms, soit un arrêt de plus d'une milliseconde entre deux armements quand le réveil est à l'heure (sous charge : ordonnanceur,
   ramasse-miettes). Quand l'écart tombe entre 2 et 3, une seule frontière suffit, et la sortie est `[0..6]`. La première version de
   ce G0 (`e46af7da`) posait d ≥ L + 2 pour les deux sorties : c'était faux pour `[0..6]`.
5. Mesures.
   - Au G0 (trace des `_idleStart` par un `setTimeout` enveloppé, 30 passages de la variante forcée à la base, attente avant 2,
     donc le seul mode `[0..5]`) : sous Node 24.21.0, d va de 2 à 5 ms ; les 3 passages verts sont tous d = 2 et L = 1, les 27
     autres sont rouges. Sous Node 22.22.2, d va de 3 à 6 ms : 30 rouges sur 30. Aucun passage ne contredit d ≥ L + 2, la règle de
     ce mode.
   - À la G2 (MONARK, Windows 10, Node 24.21.0 ; ids et échéances des listes lus un `setImmediate` après l'armement de 5 ; 560
     courses) : seul 3 en retard, 114 courses, id(1 ms) < id(40 ms) 114 fois sur 114, 17 égalités d = L + 1, toutes rouges
     `[0..6]` ; d ≥ L + 2 n'y tient que 97 fois sur 114, l'ordre (échéance, puis id) 114 fois sur 114. 2 et 3 en retard, 98
     courses : id(40 ms) < id(1 ms) 98 fois sur 98, 14 égalités, toutes vertes ; la règle tient 98 fois sur 98.
   - Au pli, sous Linux (Node 24.21.0, 4 processeurs ; scripts hors dépôt `trace3.mjs`, sha256 `062132e2…`, et `analyse3.mjs`,
     `d3b3e09d…` : la base avec une attente active de 0,5 ou de 1 ms avant 2 ou avant 3, 40 passages par case, 160 en tout ; ids
     et échéances lus comme à la G2) : 2 et 3 en retard, 71 courses, 35 égalités, toutes vertes, d ≥ L + 2 juste 71 fois sur 71 ;
     seul 3 en retard, 72 courses, id(1 ms) < id(40 ms) 72 fois sur 72, 32 égalités (d = 1 et L = 0, ou d = 2 et L = 1), toutes
     rouges `[0..6]` : d ≥ L + 2 n'y est juste que 40 fois sur 72, d ≥ L + 1 72 fois sur 72 ; 3 déjà échu avec 0 et 1 : 11
     courses, vertes ; 2 et 3 en retard dans deux ms distinctes : 6 courses, hors de la règle à deux modes.

## Règle

1. Les durées sont remplacées par deux verrous (`Promise.withResolvers`), l.102-108 du gel : `allIn` s'ouvre quand le 8e élément part
   (4 à 7 sont alors tous en vol) ; 5 l'attend puis échoue ; 0 à 3 finissent sur une microtâche ; 4, 6 et 7 attendent `failed`.
2. 5 ouvre `failed` par une minuterie de 50 ms armée juste avant son échec (`setTimeout(() => { failed.resolve(); }, 50)`, l.108,
   décision de la G2). Elle n'ordonne rien, puisque 5 a déjà échoué : elle fixe seulement la largeur de la fenêtre de drain. 4, 6 et 7
   restent en vol 50 ms après l'échec, au moins autant qu'à la base (environ 39 ms : leurs minuteries de 40 ms contre celle de 1 ms
   de 5). Une relance qui n'attend pas le drain et tombe dans cette fenêtre est vue avant eux, qu'elle suive l'échec dans la même
   chaîne de microtâches, après avoir cédé la boucle (`setImmediate`) ou à une échéance plus courte armée au stop. Limite déclarée :
   une relance plus tardive que 50 ms passerait, comme à la base au-delà d'environ 39 ms.
3. Le test est borné : `{ timeout: 10_000 }` sur sa déclaration (l.96). Si moins de 8 éléments partent, `allIn` ne s'ouvre jamais :
   le test rougit en 10 s (`testTimeoutFailure`) au lieu de pendre (300 s sous `npm test`, dont le `--test-timeout=300000` ne prime
   pas sur l'option du test ; sous red-proof, un tueur qui pend finit « inconclusive »).
4. Une seule minuterie dans ce test, celle du point 2. Les quatre assertions sont inchangées, octet pour octet : relance de la
   première erreur, suite lancée `[0..7]`, drain avant la relance, rapport des fautes tardives.
5. Une ligne `// killer:` est ajoutée juste au-dessus de la déclaration du test (l.95), qui n'en avait pas. Aucune ligne de
   production ne bouge. Les lignes du fichier sous le test descendent de 5 : seules des citations historiques des docs les visent,
   aucun tueur.

## Tueurs (listés pour `--test-only`)

- `apps/sentinel/src/ukemi/pool.ts:29 COR "!signal.stopped && " -> ""` (déclaré au-dessus du test, l.95) : le stop est ignoré au
  dispatch ; les voies lancent tout, rouge par l'assertion de la suite (l.114, `[0..29]`).
- Huit mutants tirés à la main : le tueur ci-dessus et sept autres, non listés (une seule ligne `// killer:` par test). 5 passages
  chacun, Node 24.21.0, `pool.ts` restauré et son sha256 contrôlé après chaque passage (script hors dépôt `mut8.mjs`). Chacun rougit
  par l'assertion visée (ERR_ASSERTION), à la base comme au gel ; au gel précédent `e46af7da`, les deux mutants de la G2 passaient.

  | `pool.ts` | changement | base `102b44d3` | `e46af7da` | gel `9b797c66` |
  |---|---|---|---|---|
  | `:29`, le tueur | `!signal.stopped && ` retiré (le stop ignoré au dispatch) | 5/5, l.109 | rouge (G0 ; G2 3/3) | 5/5, l.114 |
  | `:33` | `signal.stopped = true; }` devient `signal.stopped = true; throw e; }` (la voie relance, pas de drain) | 5/5, l.110 | rouge (G0 ; G2 3/3) | 5/5, l.115 |
  | `:38` | `await Promise.all(` devient `await Promise.race(` (pas de drain) | 5/5, l.110 | rouge (G0 ; G2 3/3) | 5/5, l.115 |
  | `:33` | `if (first === undefined)` devient `if (true)` (la première erreur écrasée) | 5/5, l.108 | rouge (G0 ; G2 3/3) | 5/5, l.113 |
  | `:34` | `!(e instanceof PoolStoppedError)` devient `true` (l'arrêt rapporté) | 5/5, l.111 | rouge (G0 ; G2 3/3) | 5/5, l.116 |
  | `:34` | `report?.suppressed.push(` devient `void (` (la faute tardive perdue) | 5/5, l.111 | rouge (G0 ; G2 3/3) | 5/5, l.116 |
  | `:38` (G2, `race_then_immediate38`) | `await Promise.race(…).then(() => new Promise((r) => setImmediate(r)));` (la relance après un `setImmediate`) | 5/5, l.110 | 0/5 | 5/5, l.115 |
  | `:25`, `:33`, `:38` (G2, `drain_deadline_5ms_after_stop`) | une promesse résolue au stop ; `await Promise.race([Promise.all(…), stop.promise.then(() => new Promise((r) => setTimeout(r, 5)))]);` (le drain coupé 5 ms après le stop) | 5/5, l.110 | 0/5 | 5/5, l.115 |

  Lignes du gel : l.113 relance, l.114 suite, l.115 drain, l.116 rapport (à la base : l.108 à l.111).
- Vivacité, hors des huit (mutant de la G2 `window_minus_one38` : `pool.ts:38`, `Math.min(n, items.length)` devient
  `Math.min(n - 1, items.length)` ; le test frère des bornes le rougit par assertion) : à `e46af7da`, le test pend (2 passages,
  arrêtés par la borne de 30 s du lanceur) ; au gel, il rougit en 10,3 s par `testTimeoutFailure` (« test timed out after
  10000ms »), et de même sous `--test-timeout=300000 --test-force-exit`, les drapeaux de `npm test`.

## Vérification du lot

Hôte Linux, 4 processeurs ; Node 22.22.2 (le `node` par défaut de l'hôte) et Node 24.21.0 (la version majeure de la CI et celle de
l'hôte Windows de MONARK). Base des mesures du G0 `6a1b1d43` ; le test du gel y était celui du commit `279b30d0`, identique à celui
de `5b069979` après la synchro sur `102b44d3`. Au pli de la G2 : base `102b44d3`, gel `9b797c66`, Node 24.21.0. D'autres sessions
chargeaient aussi l'hôte pendant les mesures.

- **Variante forcée, au G0** (script ci-dessous, copie du fichier de test hors git, attente active avant l'attente de l'élément 2 ;
  le gel avait alors la fenêtre d'un seul `setImmediate`) :

  | attente active | Node | base | gel |
  |---|---|---|---|
  | 1,5 ms | 22.22.2 | 30/30 rouges (3 séries de 10) | 10/10 verts |
  | 1,5 ms | 24.21.0 | 38/40 rouges (séries : 9, 10, 9, 10) | 10/10 verts |
  | 25 ms | 22.22.2 | 10/10 rouges | 10/10 verts |
  | 25 ms | 24.21.0 | 20/20 rouges (2 séries, la seconde par le script extrait de ce G0) | 20/20 verts |

  Chaque rouge porte la sortie de CI : « no item dispatched after the stop (items 4..7 were in flight) », éléments `[0..5]`. Sous
  Node 24.21.0, la variante de 1,5 ms n'est pas rouge 10 fois sur 10 à chaque série : deux passages verts sur 40, le cas d = 2 avec
  un réveil en retard de 1 ms (Constat 3 et 5). Celle de 25 ms (attente avant 2, donc le mode `[0..5]`) tient d ≥ L + 2 tant que le
  premier réveil n'a pas plus d'environ 23 ms de retard.
- **Variante forcée, au pli** (le script ci-dessous, sha256 `1c9299d0…`, extrait de ce G0 ; Node 24.21.0) :

  | attente active | élément | base `102b44d3` | gel `9b797c66` |
  |---|---|---|---|
  | 25 ms | 2 | 10/10 rouges, `[0..5]` | 20/20 verts |
  | 25 ms | 3 | 10/10 rouges, `[0..6]` | 10/10 verts |
  | 1,5 ms | 2 | non rejoué | 10/10 verts |
- **Balayage, au G0** (Node 22.22.2 et 24.21.0 ; attente de 1,5 ms puis de 5 ms avant chacun des éléments 0 à 7 ; 3 passages par
  case) : au gel, 0 rouge sur 96. À la base, l'élément 2 rougit 11 fois sur 12 (`[0..5]`, le vert est une égalité sous Node
  24.21.0) et l'élément 3 12 fois sur 12 (`[0..6]`) ; les autres cases sont vertes, sauf un rouge naturel `[0..6]` dans celle de
  l'élément 7 (Node 22.22.2), où l'attente active ne tourne même pas puisque 7 n'est pas lancé.
- **Windows** : rejoué par MONARK à la G2, sur `e46af7da` (Windows 10, Node 24.21.0, 24 processeurs) : variante de 25 ms, base
  10/10 rouges `[0..5]`, gel 10/10 verts ; variante de 1,5 ms, base 3 rouges sur 20 ; sous charge (4 puis 28 boucles actives), 0
  rouge sur 30 au gel comme à la base. L'horloge de la boucle y avance par pas de 1 ms, mais `setTimeout(0)` y dure 15 à 16 ms au
  mur (`docs/G1-lot-ukemi-conc-1.md` l.64, vérifié par la G2) : le réveil y est souvent en retard de plusieurs ms. Pour la sortie de
  CI `[0..5]`, un réveil en retard d'au moins d − 1 ms suffit pour que la base passe (égalité gagnée par 2 et 3) ; quand seul 3 est
  en retard (`[0..6]`), il y faut un retard d'au moins d (l'égalité va à 5). La variante de 1,5 ms peut donc y passer à la base ;
  celle de 25 ms (`node forced.mjs <rev> 10 2 25`) y rougit. Le rejeu Windows du gel `9b797c66` est à MONARK, à la fusion.
- **Charge, le vrai test, au G0** (script hors dépôt : 50 passages d'affilée du test seul, 6 boucles actives sur 4 processeurs ;
  charge sur 1 min lue en fin de série : de 4,7 à 13,7) : au gel, 0 rouge sur 50 sous Node 22.22.2, et 0 sur 50 deux fois sous
  Node 24.21.0 ; à la base, sous la même charge, 4 rouges sur 50 (Node 22.22.2), puis 0 et 1 sur 50 (Node 24.21.0), chaque rouge
  avec la sortie de CI.
- **Charge, le vrai test, au pli** (gel `9b797c66`, le script du G0, `load-runs.mjs`, ses boucles actives bornées à 15 min) : 4
  boucles actives sur 4 processeurs, 0 rouge sur 50 (charge sur 1 min en fin de série : 3,6) ; 8 boucles, 0 sur 50 (9,0) ; 16
  boucles, 0 sur 50 (17,9).
- **Charge de type CI** (script hors dépôt, `load-file.mjs`, Node 24.21.0 : 5 lanceurs en parallèle, chacun 10 passages du fichier
  entier, ses 13 tests, fsync compris, plus 2 boucles actives) : au G0, charge sur 1 min jusqu'à 15,4, le test du pool 0 rouge sur
  50, les 12 autres tests 0 rouge sur 600 ; au pli (gel `9b797c66`, 14 min 22 s, sous les 15 min des boucles), charge jusqu'à
  12,0, le test du pool 0 rouge sur 50, les 12 autres 0 rouge sur 600.
- **Tueurs** : les huit ci-dessus, rouges au gel et à la base par l'assertion visée (Node 24.21.0) ; les six premiers aussi sous
  Node 22.22.2, au G0.
- **Portes, au pli** (Node 24.21.0, sur `102b44d3` plus ce lot) : `tsc --noEmit` 0 ; `eslint` du fichier touché 0 ; `lint:ratchet`
  69/69 ; `gate:vocab`, `lang:gate` et `export:check` verts ; winlint de l'atelier : 2 fichiers, aucun risque Windows ; la garde du
  tronc `test/killer-lines.test.ts` (`every_killer_line_is_readable`) : verte ; le fichier `ukemi-conc.test.ts` entier : 13/13.
- **red-proof, au pli** : `node scripts/red-proof.mjs --base 102b44d3 --gel . --test-only` (Node 24.21.0, gel `9b797c66`) : OK,
  sortie 0 ; 1 test jugé, `pinned` : sa déclaration est lue l.96, avec `{ timeout: 10_000 }`, et son tueur l.95, juste au-dessus ;
  vert à la base et au gel ; tueur `pool.ts:29` tiré au gel : tué par assertion (l.114, `[0..29]`), `pool.ts` restauré, sha256
  `2119cfd0…` avant et après ; 12 inchangés ; aucune production, aucun retrait ; G0 déclaré : celui-ci (`RED-PROOF.json` sha256
  `300f271e…`, empreinte des changements `5803e21c…` ; au G0, `f77c6b19…` : le fichier de test a changé depuis).
- **Ancres, au pli** : `verifie-ancres.mjs` sur tout l'arbre : 1 603 tueurs, 1 603 ancrés, 0 dérivé, 0 perdu.

Hors lot, vu en vérifiant : sous Node 22.22.2, `ukemi_conc_retry_attempt_re_enters_the_gate` rougit à la base comme au gel
(« finalized: quorum needs 2 providers ») ; il passe sous Node 24.21.0, et `package.json` exige Node 24 ou plus.

### Script de la variante forcée

À lancer depuis la racine d'un clone qui a ses `node_modules` (Linux ou Windows, Node 22 ou plus) : `node forced.mjs <rev> [passages=10]
[élément=2] [ms=1.5]`. Il copie le fichier de test de `<rev>`, insère l'attente active juste avant l'attente du worker, lance ce seul
test, puis retire la copie.

```js
import { execFileSync, spawnSync } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";

const [rev, runs = "10", item = "2", ms = "1.5"] = process.argv.slice(2);
const T = "ukemi_conc_pool_first_error_stops_dispatch_and_drains_before_rethrow";
const F = "apps/sentinel/test/ukemi-conc-forced.test.ts";
const src = execFileSync("git", ["show", `${rev}:apps/sentinel/test/ukemi-conc.test.ts`], { encoding: "utf8" }).split("\n");
const start = src.findIndex((l) => l.startsWith(`test("${T}"`));
const at = src.findIndex((l, i) => i > start && /^ {4}await /.test(l));
if (start < 0 || at < 0) throw new Error(`${rev}: the test or the wait of its worker is not found`);
src.splice(at, 0, `    if (i === ${item}) { const t0 = performance.now(); while (performance.now() - t0 < ${ms}); } // forced`);
writeFileSync(F, src.join("\n"));
let red = 0;
try {
  for (let k = 1; k <= Number(runs); k++) {
    const r = spawnSync(process.execPath, ["--test", "--test-reporter=tap", `--test-name-pattern=^${T}$`, F], { encoding: "utf8" });
    const pass = r.status === 0 && /^# pass 1$/m.test(r.stdout);
    const msg = /^ {2}error: \|-\n {4}(.*)$/m.exec(r.stdout)?.[1] ?? "";
    const act = /^ {2}actual:\n((?: {4}\d+: .*\n)+)/m.exec(r.stdout)?.[1].split("\n").filter(Boolean).map((l) => l.split(": ")[1]).join(",") ?? "";
    if (!pass) red++;
    console.log(`${rev} run ${k}: ${pass ? "pass" : `RED ${msg} actual [${act}]`}`);
  }
} finally {
  rmSync(F, { force: true });
}
console.log(`${rev} item ${item} busy ${ms} ms: ${red}/${runs} red`);
```

## G2 (instance neuve, MONARK, Windows 10) : CORRECTIONS, pliées

1. **M : la règle de l'égalité était fausse dans un des deux modes** (Constat 3 et 4, la ligne « Rejeu Windows » de la
   Vérification, corps public). Pliée : la règle est un ordre (échéance, puis id de liste), avec ses deux modes (Constat 2 à 5),
   rejouée sous Linux au point 5 ; « un réveil en retard d'au moins d − 1 ms suffit pour que la base passe » ne vaut que pour la
   sortie de CI `[0..5]` : quand seul 3 est en retard, il y faut un retard d'au moins d (Vérification, Windows). Le corps public de
   #240 dit de même.
2. **M : l'oracle de drain avait rétréci.** À `e46af7da`, 4, 6 et 7 se réglaient un seul `setImmediate` après l'échec de 5 : une
   relance qui saute le drain après avoir cédé la boucle passait. Pliée par la décision de la G2 (Règle 2) : la minuterie de 50 ms.
   Les deux mutants de la G2 entrent aux Tueurs : verts à `e46af7da` (0/5 chacun), rouges au gel et à la base (5/5 chacun, par
   l'assertion du drain). La phrase de l'ancienne Règle 1 qui prêtait une seule forme à toute relance sans drain sort de ce G0 et du
   corps public. Rejoué au pli : variante forcée et charge (Vérification).
3. **m : vivacité.** Pliée (Règle 3) : `{ timeout: 10_000 }` ; red-proof lit encore la déclaration (l.96), et la ligne `// killer:`
   reste juste au-dessus (l.95).
4. **Les messages de `5b069979` et de `e46af7da` (points 1 et 4 de la G2) portent un récit caduc.** Ils ne sont pas réécrits : on
   ne force pas le push d'une branche publiée, et ni rebase ni amend ne touchent ces deux commits. Leur récit de l'égalité est
   caduc, et voici pourquoi. `e46af7da` dit « on an exact tie Node runs the 40 ms list first » : c'est vrai seulement quand 2 et 3
   sont en retard (la sortie de CI `[0..5]`), où la liste de 40 ms, réarmée avant que 5 n'arme, a le plus petit id ; quand seul 3
   est en retard, la liste de 1 ms de 5 naît avant ce réarmement, gagne l'égalité, et la base rougit `[0..6]` dès d ≥ L + 1.
   `5b069979` dit qu'une frontière de milliseconde entre deux des quatre premières minuteries laissait la minuterie de 1 ms de 5
   gagner l'égalité et arrêter le pool avant 6 et 7 : pour la sortie `[0..5]`, cette égalité va à la liste de 40 ms et le test
   passe ; là où une seule frontière suffit (entre 2 et 3), seul 7 manque, `[0..6]`. Son « items 4, 6 and 7 settle one macrotask
   after that failure » est caduc aussi : depuis `9b797c66`, ils se règlent 50 ms après. Ce G0 (Constat 2 à 5, Règle 2) fait foi.

## Taille

11 lignes changées hors `docs/**/*.md` (8 ajoutées, 3 retirées, un seul fichier), compte de la CI : `git diff --shortstat
102b44d3...HEAD` avec les exclusions de `.github/workflows/ci.yml` (9 au G0). Borne de notre règle : 547.

## Ligne d'ETAT proposée à MONARK

L'ETAT du tronc `102b44d3` n'a pas de ligne pour cet item (`git grep` de `POOL-FLAKE`, `CONC-POOL` et du nom du test dans
`docs/ETAT*.md` : rien). Ligne proposée, à poser avec la fusion :

```text
  - UKEMI-CONC-POOL-FLAKE-1 (rouge de hasard de `ukemi_conc_pool_first_error_stops_dispatch_and_drains_before_rethrow`, vu en CI sur
    #99 puis sur `f0933604` de #237 : `[0..5]` au lieu de `[0..7]`) : l ordre du test tenait à des durées (1 ms contre 40 ms) ; pour
    la sortie de CI [0..5], un arrêt de plus d une milliseconde entre les armements des minuteries de 1 et de 3 laissait 5 échoir le
    premier et arrêter le pool avant 6 et 7 (quand seul 3 est en retard, une frontière suffit et la sortie est [0..6]). Porteur :
    RECHERCHES (accord de MONARK `2e1d468`) ; état : clos le 2026-10-07 par #240 (fusion `<sha>`) : deux verrous fixent l ordre,
    une minuterie de 50 ms fixe seulement la fenêtre de drain, le test est borné à 10 s ; variante forcée à la base : 30/30 rouges
    (1,5 ms, Node 22.22.2), 38/40 (1,5 ms, Node 24.21.0), 30/30 (25 ms, les deux Node), puis 20/20 au pli (25 ms, avant 2 ou avant
    3) ; au gel : tout vert ; rejeu Windows à MONARK, avec la variante de 25 ms (`docs/G0-lot-ukemi-conc-pool-flake-1.md`).
```
