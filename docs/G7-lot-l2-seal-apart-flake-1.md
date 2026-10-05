# G7 du lot L2-SEAL-APART-FLAKE-1 : `l2_seal_apart_child_killed` tient ses enfants sur une FIFO

- **Plan** : `docs/G0-lot-l2-seal-apart-flake-1.md`. **Base** : `753a23a9` (`origin/base/chantier-moteur-2026-10-03`). Branche `recherches/l2-seal-apart-flake-1`.
- **Commits** : `66b3c4af` (G0), `e3f88116` (test), `d09e9fc4` (G7), puis, après le G2 frais (APPROUVÉ, deux réserves), `c01481b0` (test : R-1, N-1, N-4 ; **gel**) et cette reprise du G7 (R-2, N-2, N-3). Hôte : Linux, Node 24.21.0, 4 cœurs, sous la charge d'autres sessions.
- **Tronc** : `origin/lot/etude-suite` (`ae460d28`) porte le même test, mot pour mot (`test/l2-loop.test.ts:637`, assertion `:642`). Son `sealApart` diffère (n-12 : `halt` tue puis résout à la fermeture de l'enfant, `finish(killed ?? ...)`), mais le résultat reste `seal_timeout` même si l'enfant a déjà scellé : la même course y vaut. Ce lot vise la base. **Le portage au tronc n'est pas mot pour mot** (R-2 du G2) : voir la section « Portage au tronc ».

## Cause (prouvée)

Le tuple de l'assertion est `[a.sealed, b.sealed, (sommeil de 3 s), SHA256SUMS de a existe, SHA256SUMS de b existe]`. Le 4e élément `true` dit que le jour de `a` est scellé ; `a` est lancé par `sealApart(specOf(a), { timeoutMs: 1 })`.

1. **Seul écrivain possible.** Le dossier de `a` est `out-<n>` sous un `mkdtempSync(join(tmpdir(), "l2-loop-"))` propre au fichier : le `TMPDIR` partagé n'y fait rien. Seul l'enfant de `a` écrit `days/BTCUSDT/2026-10-04/SHA256SUMS` (`scripts/l2/day.mjs:216`, `linkSync`, dernière écriture du scellement).
2. **Avant le tueur.** `halt` (`scripts/l2/seal.mjs:60`) envoie `SIGKILL` puis rend l'échec ; un enfant tué n'exécute plus rien. Le 1er élément `false` dit que la promesse a été résolue par un échec, non par la fermeture d'un enfant sorti avec son résultat (ce serait `sealed: true`). Donc l'enfant a lié `SHA256SUMS` **avant** que l'échéance du parent ne tire.
3. **Mécanisme.** L'échéance est un `setTimeout(…, 1)` du parent (`seal.mjs:72`) : une borne basse. Un parent non servi par l'ordonnanceur plus longtemps que tout le scellement de l'enfant laisse celui-ci finir ; à la reprise, libuv passe la phase des minuteries avant celle des entrées-sorties : `halt("seal_timeout")` tue un enfant déjà sorti et rend `sealed: false`. Le test suppose qu'une échéance de 1 ms gagne toujours ; c'est faux par contrat de Node. **Le code n'est pas en faute** : il tient « jamais pendante au-delà de timeoutMs » et tue l'enfant à l'échéance ; la faute est l'hypothèse du test.

### Reproduction forcée, déterministe

Préchargement `force-late.cjs` (sha256 `9b6175fc1fa1cc2c…`, scratchpad, hors dépôt, par `NODE_OPTIONS=--require`) : après le **premier** `spawn` de `seal-child.mjs`, il tient le parent de façon synchrone (`Atomics.wait` par pas de 5 ms) jusqu'à ce que cet enfant soit zombie, borne 30 s ; il simule un parent non servi. Test seul (`--test-name-pattern`).

| Arbre | Courses | Parent tenu | `SHA256SUMS` de `a` à l'échéance | Résultat |
|---|---|---|---|---|
| base `753a23a9` | 3 | 78, 79, 100 ms | vrai | **rouge par assertion**, `actual: [false, false, undefined, true, false]` (le tuple observé, exactement) |
| base, sans forçage | 1 | — | — | vert |
| gel `e3f88116` (même fichier de test, sha256 `922e6c78…`) | 2 | 30 000 ms (borne) | faux | vert : l'enfant reste bloqué sur la FIFO, ne scelle jamais avant d'être tué |
| gel, sans forçage | 2 | — | — | vert |

L'enfant scelle ce jour de 4 trames en environ 80 ms à vide : un retard du parent de cet ordre suffit.

### Course résiduelle du premier gel (R-1 du G2), retirée

Au premier gel (`e3f88116`), le sommeil de 3 s était armé à côté de l'échéance de 1 ms. Un parent tenu plus de 3 s après cet armement exécutait l'échéance (le `SIGKILL`), puis la minuterie de 3 s déjà échue, puis `reader` quelques microsecondes après le `kill(2)` : l'enfant tué tenait encore sa FIFO (`'a reader'`). Correction : `ends` est un `Promise.all`, `ac.abort()` suit, et le sommeil n'est armé qu'après `await ends` ; un enfant tué a toujours 3 s pour mourir.

Preuve, préchargement du G2 `scratchpad/g2sg/stall-after-arm.cjs` (`STALL_ON=1`, `STALL_MS=3200` : parent tenu 3,2 s juste après l'armement de l'échéance de 1 ms), 12 boucles CPU (mes PID, arrêtées par PID), test seul, lanceur `scratchpad/sf/stall-runs.sh` :

| Arbre | Courses | Résultat |
|---|---|---|
| premier gel `d09e9fc4` | 6 | **5 rouges** par assertion, `actual: [false, false, undefined, 'a reader', 'ENXIO', false, false]` |
| gel `c01481b0` | 6 | **6 verts** |
| gel, `STALL_ON` par défaut (tenu après la minuterie de 3 s) | 3 | 3 verts |
| gel, `force-late` | 2 | 2 verts (parent tenu 30 s, `SHA256SUMS` faux) |

### Mesure sous charge (retard réel de l'échéance)

Préchargement `watch-late.cjs` (sha256 `679955c0e04a4a29…`, mesure seule, aucun ordre changé) : pour chaque enfant lancé avec une échéance de 1 ms, le retard de l'échéance après le retour de `spawn`, et si `SHA256SUMS` existait alors. Lanceur `stress.sh` (sha256 `c11d6561af34c28f…`) : `node --test --test-force-exit --test-concurrency=16 test/l2-*.test.ts`, N lanceurs sur un même `TMPDIR`.

| Arbre | Charge | Exécutions | Rouges de `l2_seal_apart_child_killed` | Échéances mesurées | Retard max | `SHA256SUMS` à l'échéance |
|---|---|---|---|---|---|---|
| base | 6 × 8 | 48 | 0 | 96 | 10,8 ms | 0 |
| base | 8 × 14 | 112 | 0 | 224 | **82,4 ms** | 0 |
| premier gel `e3f88116` | 8 × 14 | 112 | **0** (112 verts) | 224 | 31,1 ms | 0 |
| gel `c01481b0` | 6 × 8 | 48 | **0** (48 verts) | — | — | — |

La queue du retard atteint le temps de scellement de l'enfant (82 ms contre environ 80 ms) : la course est réelle et rare, d'où 1 sur 48 dans l'enquête d'origine et 0 sur 160 ici. Le rouge naturel n'a pas été revu ; la preuve tient par l'élimination ci-dessus et la reproduction forcée. Au gel, l'enfant ne peut pas sceller avant d'être tué, quel que soit le retard du parent ; la seule marge qui reste est le temps laissé au noyau pour retirer l'enfant tué avant `reader` : 3 s armées après la fin des deux appels (R-1, ci-dessous).

Rouges d'autres tests pendant ces charges, hors lot : `l2_free_bytes_default` (`test/l2-record.test.ts:263`, « bavail x bsize, a few blocks apart » : l'espace libre bouge sous les écritures concurrentes) 3 + 6 + 2 + 1 fois, et `test/l2-fake-place.test.ts:78` 2 fois (base). À ouvrir en items séparés.

## Changement (test seul)

| Fichier | Ligne | Changement |
|---|---|---|
| `test/l2-loop.test.ts` | 633 | saut : `APART \|\| (process.platform === "win32" ? "no FIFO on win32" : false)` (N-1) |
| `test/l2-loop.test.ts` | 635-637 | commentaire : la cause, la règle, le sommeil armé après les appels, la libération d'un enfant vivant (N-4) |
| `test/l2-loop.test.ts` | 638, 640 | `journal.jsonl` de `a` et `b` devient une FIFO (`mkfifo`, comme `l2_append_not_a_file`) que personne n'ouvre en écriture : l'enfant s'y bloque dans `journalOf` (`day.mjs:68`), avant toute écriture du jour |
| `test/l2-loop.test.ts` | 641 | `reader(o)` : ouverture `O_WRONLY \| O_NONBLOCK` de la FIFO, `ENXIO` sans lecteur |
| `test/l2-loop.test.ts` | 642-644 | `ends = Promise.all([...])`, `ac.abort()`, puis `sealed` et le sommeil de 3 s armé après `await ends` (R-1) |
| `test/l2-loop.test.ts` | 645-646 | attendu `[false, false, undefined, "ENXIO", "ENXIO", false, false]` : après le temps du scellement, aucun enfant ne tient sa FIFO (mort) et aucun jour n'est scellé |

Ni nouvel essai, ni délai allongé ; le sommeil de 3 s garde sa durée, armé plus tard. Le test prouve davantage qu'avant : l'enfant est mort (sans lecteur), pas seulement « rien n'est scellé ». `APART` saute déjà ce test sous win32 ; aucun nom réservé.

## Notes du G2

- **N-2 (macOS)** : `seal-child.mjs` exige `/proc/self/fd/3` ; sous darwin l'enfant s'arrête `out_not_l2` en quelques ms, le test passe sans exercer le kill, avant comme après ; darwin n'est pas en CI.
- **N-3 (preuve de mort)** : elle repose sur `ENXIO` seul ; le seul lecteur possible est l'enfant (dossier sous le `mkdtemp` du fichier, le parent n'ouvre jamais la FIFO) ; un enfant vivant encore en démarrage donnerait aussi `ENXIO`, mais il atteint la FIFO en 51 à 73 ms, contre 3 s de marge.
- **N-4 (pas d'orphelin)** : en mode tueur, l'ouverture puis la fermeture de `reader` donnent EOF à l'enfant vivant, qui finit et sort ; c'est pourquoi le tueur ne laisse pas d'orphelin sur la base (dit au commentaire `:636-637`).

## Portage au tronc (R-2 du G2) : item `L2-SEAL-APART-TRUNK-PORT-1`

Sur `origin/lot/etude-suite`, `sealApart` ne résout qu'à la fermeture de l'enfant (n-12, `finish(killed ?? …)`). Le test de ce lot y passe, mais son tueur `seal.mjs:60` (`child?.kill("SIGKILL")` -> `0`) y laisse les enfants bloqués sur leur FIFO : `ends` ne se résout jamais, le test reste pendant jusqu'à `--test-timeout` (300 s), finit `cancelled` et non rouge par assertion, et `--test-force-exit` laisse deux orphelins (ppid 1) que plus personne ne peut libérer (G2 : mesuré à 10 s). Au portage : borner l'attente de `ends` (`Promise.race` avec un sommeil, valeur `"pending"` dans le tuple) et ouvrir puis fermer chaque FIFO en `O_WRONLY | O_NONBLOCK` dans un `finally`, avant le `rmSync` du crochet `after`. Prix : test seul, environ 6 lignes changées dans `l2_seal_apart_child_killed` (R-25 environ 12), même tueur, une course de charge et le tueur tiré au tronc ; un lot court, à joindre à la fusion de la base dans le tronc.

## Tueur

`// killer: scripts/l2/seal.mjs:60 CONST "child?.kill(\"SIGKILL\")" -> "0"` (ligne 632, inchangée). Au gel `c01481b0`, tiré à la main dans le worktree : sha256 de `seal.mjs` `e62440d823c1c28d…` avant, **rouge par assertion** en 3,2 s (`'a reader'` ×2), restauré, même sha256, aucun `seal-child` restant. Au premier gel, sur un clone : sha256 de `seal.mjs` `e62440d823c1c28d…` avant, ligne 60 devenue `{ 0; finish(failed(stop, detail)); }`, test **rouge par assertion** (`actual: [false, false, undefined, 'a reader', 'a reader', false, false]` : les deux enfants vivants tiennent leur FIFO) ; fichier restauré, sha256 `e62440d823c1c28d…` identique.

## Oracle

- `node scripts/red-proof.mjs --base 753a23a9 --gel c01481b0 --repo . --test-only` : **OK** ; 1 test jugé, 48 inchangés ; `pinned` `l2_seal_apart_child_killed`, tueur `scripts/l2/seal.mjs:60 CONST` tiré au gel : **tué**. `RED-PROOF.json` sha256 `8fb599f78bbeeb99…` (premier gel `e3f88116` : OK aussi, `f053cf658d8bee22…`).
- La forme F2P (`--draw 1 --seed 37`) refuse, comme attendu pour un lot de test seul : « green at base: a self-confirming test » (le code de production est le même ; le rouge à la base n'existe que sous le forçage ci-dessus).
- `verifie-ancres.mjs . --touched origin/base/chantier-moteur-2026-10-03 HEAD` : **49 tueurs, 49 ANCRE, 0 DERIVE, 0 PERDU**.
- `npm run test:main` au gel `c01481b0` : **2561 tests, 2539 verts, 0 échec, 22 sautés** (exit 0). `test/l2-loop.test.ts` seul, 5 fois : 49/49 chaque fois.
- `tsc --noEmit` vert ; `eslint .` vert ; `lint:ratchet` 69/69 ; `gate:vocab` OK ; `lang:gate` OK.
- R-25 contre `origin/base/chantier-moteur-2026-10-03` (refetchée, toujours `753a23a9`) : +12/−4, **16 lignes** (sous 547), GREEN.

## Remarque pour le câblage de la boucle (hors lot, sans changement ici)

Un `seal_timeout` (ou `seal_aborted`) ne prouve pas que le jour reste non scellé : si le parent est en retard, l'enfant peut avoir fini avant l'échéance. L'en-tête de `seal.mjs` (« the day stays unsealed ») en dit plus que le code ne tient. La boucle, quand elle appellera `sealApart`, devra lire `day_sealed` au nouvel essai comme un jour déjà scellé. Proposé en item : `L2-SEAL-APART-LATE-DEADLINE-1`.
