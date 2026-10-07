# G0 du lot UKEMI-CONC-POOL-FLAKE-1 : l'ordre du test d'arrêt du pool, fixé par des verrous et non par des durées

effort: max (passé par l'orchestrateur de RECHERCHES) ; horloge lue à 13:28 UTC le 2026-10-07 (`date -u`).

- **Demande** : item `UKEMI-CONC-POOL-FLAKE-1`, accordé par MONARK (recherches `2e1d468`,
  `2026-10-07-MONARK-vers-RECHERCHES-a2-i-pliee.md`) : une PR courte, test seul ; l'ordre devient déterministe, sans dépendre des
  frontières de milliseconde ; la variante forcée (attente active de 1,5 ms) rougit 10 fois sur 10 à la base et passe 10 fois sur 10
  après. Le test `ukemi_conc_pool_first_error_stops_dispatch_and_drains_before_rethrow` (`apps/sentinel/test/ukemi-conc.test.ts:95`
  à la base) a rougi en CI sur `f0933604` (#237) : assertion l.109, éléments lancés `[0..5]` au lieu de `[0..7]`.
- **Base** : `102b44d3` (`origin/lot/etude-suite`), branche `recherches/ukemi-conc-pool-order`. Auteur : RECHERCHES. Les mesures
  ci-dessous ont été prises sur la base précédente, `6a1b1d43` : `apps/sentinel/` et `packages/` y sont identiques
  (`git diff 6a1b1d43 102b44d3 -- apps/sentinel packages` est vide).
- **Zone** : `apps/sentinel/test/ukemi-conc.test.ts` (le seul test nommé ci-dessus) ; ce G0. Aucun code de production :
  `apps/sentinel/src/ukemi/pool.ts` est inchangé (sha256 `2119cfd0…`). L'ETAT ne porte pas de ligne pour cet item : la ligne est
  donnée à MONARK, qui la pose.

red-proof: test-only

## Constat

Le pool fait ce que dit son contrat (`pool.ts:1-11`) ; c'est l'ordre du test, réglé par des durées, qui dépend de l'horloge.

1. Les éléments 0 à 3 arment chacun une minuterie de 40 ms, l'un après l'autre dans le même tour ; 5 arme une minuterie de 1 ms,
   4, 6 et 7 des minuteries de 40 ms. Node date chaque minuterie d'une lecture neuve de l'horloge de la boucle, à la milliseconde
   (`insert(item, msecs, start = binding.getLibuvNow())`, `lib/internal/timers.js`, lu dans Node 24.21.0).
2. Quand 0 puis 1 partent, la voie de 0 lance 4 et celle de 1 lance 5. Si 2 et 3 ne sont pas encore échus, la liste des 40 ms est
   réarmée pour eux avec un nouvel identifiant (`listOnTimeout` : `list.id = timerListId++`) avant que la voie de 1 n'arme la
   minuterie de 5 : la liste de 1 ms naît après, et à échéance égale 2 et 3 passent d'abord.
3. Soit d l'écart, en millisecondes de la boucle, entre l'armement de 1 et celui de 3, et L le retard, en ms, de l'armement de 5
   sur l'échéance de 1. Rouge si et seulement si l'échéance de 5 précède strictement celle de 3, soit d ≥ L + 2 : 5 échoue et
   arrête le pool avant que 3 ne parte, et la voie de 3 ne lance pas 7. Si l'écart tombe entre 1 et 2, 2 est en retard aussi et 6
   ne part pas non plus : `[0..5]`, la sortie de CI ; entre 2 et 3 seulement : `[0..6]`.
4. **Précision sur la cause donnée par RECHERCHES** (recherches `1f2b02c`) : un écart de 1 ms, une seule frontière franchie, ne
   suffit pas, c'est un ex aequo que 2 et 3 gagnent. Il faut un écart d'au moins L + 2 ms, soit un arrêt de plus d'une
   milliseconde entre deux armements quand le réveil est à l'heure (sous charge : ordonnanceur, ramasse-miettes).
5. Mesure (trace des `_idleStart` par un `setTimeout` enveloppé, 30 passages de la variante forcée à la base) : sous Node 24.21.0,
   d va de 2 à 5 ms ; les 3 passages verts sont tous d = 2 et L = 1, les 27 autres sont rouges. Sous Node 22.22.2, d va de 3 à
   6 ms : 30 rouges sur 30. Aucun passage ne contredit la règle d ≥ L + 2.

## Règle

1. Les durées sont remplacées par deux verrous (`Promise.withResolvers`), l.102-108 du gel : `allIn` s'ouvre quand le 8e élément part
   (4 à 7 sont alors tous en vol) ; 5 l'attend puis échoue ; 0 à 3 finissent sur une microtâche ; 4, 6 et 7 attendent `failed`, que
   5 ouvre par un `setImmediate` armé juste avant son échec. Ils finissent donc une macrotâche après l'échec : une relance qui
   n'attendrait pas le drain (toujours une chaîne de microtâches) serait vue avant eux.
2. Aucune minuterie dans ce test. Les quatre assertions sont inchangées, octet pour octet : relance de la première erreur, suite
   lancée `[0..7]`, drain avant la relance, rapport des fautes tardives.
3. Une ligne `// killer:` est ajoutée au-dessus du test, qui n'en avait pas. Aucune ligne de production ne bouge. Les lignes du
   fichier sous le test descendent de 5 : seules des citations historiques des docs les visent, aucun tueur.

## Tueurs (listés pour `--test-only`)

- `apps/sentinel/src/ukemi/pool.ts:29 COR "!signal.stopped && " -> ""` (déclaré au-dessus du test, l.95) : le stop est ignoré au
  dispatch ; les voies lancent tout, rouge par l'assertion de la suite (l.114, `[0..29]`).
- Tirés à la main, non listés (une seule ligne `// killer:` par test) ; chacun rouge par son assertion (ERR_ASSERTION), à la base
  comme au gel, `pool.ts` restauré et son sha256 contrôlé :
  - `pool.ts:33` : `signal.stopped = true; }` devient `signal.stopped = true; throw e; }` (la voie relance, pas de drain) : l.115 ;
  - `pool.ts:38` : `await Promise.all(` devient `await Promise.race(` (pas de drain) : l.115 ;
  - `pool.ts:33` : `if (first === undefined)` devient `if (true)` (la première erreur écrasée) : l.113 ;
  - `pool.ts:34` : `!(e instanceof PoolStoppedError)` devient `true` (l'arrêt rapporté) : l.116 ;
  - `pool.ts:34` : `report?.suppressed.push(` devient `void (` (la faute tardive perdue) : l.116.

## Vérification du lot

Hôte Linux, 4 processeurs ; Node 22.22.2 (le `node` par défaut de l'hôte) et Node 24.21.0 (la version majeure de la CI et celle de
l'hôte Windows de MONARK). Base des mesures `6a1b1d43` ; le test du gel est celui du commit `279b30d0`, identique à celui de
`5b069979` après la synchro sur `102b44d3`. D'autres sessions chargeaient aussi l'hôte pendant les mesures.

- **Variante forcée** (script ci-dessous, copie du fichier de test hors git, attente active avant l'attente de l'élément 2) :

  | attente active | Node | base | gel |
  |---|---|---|---|
  | 1,5 ms | 22.22.2 | 30/30 rouges (3 séries de 10) | 10/10 verts |
  | 1,5 ms | 24.21.0 | 38/40 rouges (séries : 9, 10, 9, 10) | 10/10 verts |
  | 25 ms | 22.22.2 | 10/10 rouges | 10/10 verts |
  | 25 ms | 24.21.0 | 20/20 rouges (2 séries, la seconde par le script extrait de ce G0) | 20/20 verts |

  Chaque rouge porte la sortie de CI : « no item dispatched after the stop (items 4..7 were in flight) », éléments `[0..5]`. Sous
  Node 24.21.0, la variante de 1,5 ms n'est pas rouge 10 fois sur 10 à chaque série : deux passages verts sur 40, le cas d = 2 avec
  un réveil en retard de 1 ms (Constat 3 et 5). Celle de 25 ms tient d ≥ L + 2 tant que le premier réveil n'a pas plus d'environ
  23 ms de retard.
- **Balayage** (Node 22.22.2 et 24.21.0 ; attente de 1,5 ms puis de 5 ms avant chacun des éléments 0 à 7 ; 3 passages par case) :
  au gel, 0 rouge sur 96. À la base, l'élément 2 rougit 11 fois sur 12 (`[0..5]`, le vert est un ex aequo sous Node 24.21.0) et
  l'élément 3 12 fois sur 12 (`[0..6]`) ; les autres cases sont vertes, sauf un rouge naturel `[0..6]` dans celle de l'élément 7
  (Node 22.22.2), où l'attente active ne tourne même pas puisque 7 n'est pas lancé.
- **Rejeu Windows** : à MONARK. La minuterie de win32 tombe par pas d'environ 16 ms (`setTimeout(0)` mesuré, `docs/G1-lot-ukemi-conc-1.md`
  l.64) : un réveil en retard d'au moins d - 1 ms y suffit pour que la base passe (ex aequo gagné par 2 et 3, ou 0 à 3 partis
  ensemble), et la variante de 1,5 ms peut y passer à la base. La variante de 25 ms (`node forced.mjs <rev> 10 2 25`) est celle qui
  devrait y rougir 10 fois sur 10 à la base ; non rejoué ici.
- **Charge, le vrai test** (script hors dépôt : 50 passages d'affilée du test seul, 6 boucles actives sur 4 processeurs ; charge
  sur 1 min lue en fin de série : de 4,7 à 13,7) : au gel, 0 rouge sur 50 sous Node 22.22.2, et 0 sur 50 deux fois sous Node 24.21.0 ;
  à la base, sous la même charge, 4 rouges sur 50 (Node 22.22.2), puis 0 et 1 sur 50 (Node 24.21.0), chaque rouge avec la sortie de
  CI.
- **Charge de type CI, au gel** (script hors dépôt, Node 24.21.0) : 5 lanceurs en parallèle, chacun 10 passages du fichier entier (ses
  13 tests, fsync compris), plus 2 boucles actives, charge sur 1 min jusqu'à 15,4 : le test du pool 0 rouge sur 50, les 12 autres
  tests 0 rouge sur 600.
- **Tueurs** : les six ci-dessus, rouges au gel et à la base par l'assertion visée, sous Node 22.22.2 et 24.21.0.
- **Portes** (Node 24.21.0, sur `102b44d3` plus ce lot) : `tsc --noEmit` 0 ; `eslint .` 0 ; `lint:ratchet` 69/69 ; `gate:vocab`,
  `lang:gate` et `export:check` verts ; winlint de l'atelier : aucun risque Windows ; la garde neuve du tronc
  `test/killer-lines.test.ts` : verte.
- **red-proof** : `node scripts/red-proof.mjs --base 102b44d3 --gel . --test-only` (Node 24.21.0) : OK, sortie 0 ; 1 test jugé,
  `pinned` (vert à la base et au gel, tueur `pool.ts:29` tiré au gel : tué par assertion, `pool.ts` restauré, sha256 `2119cfd0…`
  avant et après) ; 12 inchangés ; aucune production, aucun retrait ; G0 déclaré : celui-ci (`RED-PROOF.json` sha256
  `08692153…`, empreinte des changements `f77c6b19…`, la même que contre `6a1b1d43`).
- **Ancres** : `verifie-ancres.mjs` sur tout l'arbre : 1 603 tueurs, 1 603 ancrés, 0 dérivé, 0 perdu.

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

## Taille

9 lignes changées hors `docs/**/*.md` (7 ajoutées, 2 retirées, un seul fichier), compte de la CI : `git diff --shortstat
102b44d3...HEAD` avec les exclusions de `.github/workflows/ci.yml`. Borne de notre règle : 547.

## Ligne d'ETAT proposée à MONARK

L'ETAT du tronc `102b44d3` n'a pas de ligne pour cet item (`git grep` de `POOL-FLAKE`, `CONC-POOL` et du nom du test dans
`docs/ETAT*.md` : rien). Ligne proposée, à poser avec le numéro de PR et la fusion :

```text
  - UKEMI-CONC-POOL-FLAKE-1 (rouge de hasard de `ukemi_conc_pool_first_error_stops_dispatch_and_drains_before_rethrow`, vu en CI sur
    #99 puis sur `f0933604` de #237 : `[0..5]` au lieu de `[0..7]`) : l ordre du test tenait à des durées (1 ms contre 40 ms) ; un arrêt
    de plus d une milliseconde entre les armements des minuteries de 1 et de 3 laissait 5 échoir le premier et arrêter le pool avant 6
    et 7. Porteur : RECHERCHES (accord de MONARK `2e1d468`) ; état : clos le 2026-10-07 par #<n> (fusion `<sha>`) : deux verrous fixent
    l ordre, plus aucune minuterie dans ce test ; variante forcée à la base : 30/30 rouges (1,5 ms, Node 22.22.2), 38/40 (1,5 ms, Node
    24.21.0), 30/30 (25 ms, les deux Node) ; au gel : tout vert ; rejeu Windows à MONARK, avec la variante de 25 ms
    (`docs/G0-lot-ukemi-conc-pool-flake-1.md`).
```
