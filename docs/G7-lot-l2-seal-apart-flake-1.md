# G7 du lot L2-SEAL-APART-FLAKE-1 : `l2_seal_apart_child_killed` tient ses enfants sur une FIFO

- **Plan** : `docs/G0-lot-l2-seal-apart-flake-1.md`. **Base** : `753a23a9` (`origin/base/chantier-moteur-2026-10-03`). Branche `recherches/l2-seal-apart-flake-1`.
- **Commits** : `66b3c4af` (G0), `e3f88116` (test ; **gel**), puis ce G7. Hôte : Linux, Node 24.21.0, 4 cœurs, sous la charge d'autres sessions.
- **Tronc** : `origin/lot/etude-suite` (`ae460d28`) porte le même test, mot pour mot (`test/l2-loop.test.ts:637`, assertion `:642`). Son `sealApart` diffère (n-12 : `halt` tue puis résout à la fermeture de l'enfant, `finish(killed ?? ...)`), mais le résultat reste `seal_timeout` même si l'enfant a déjà scellé : la même course y vaut. Ce lot vise la base ; le même changement de test s'appliquera au tronc à la fusion.

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

### Mesure sous charge (retard réel de l'échéance)

Préchargement `watch-late.cjs` (sha256 `679955c0e04a4a29…`, mesure seule, aucun ordre changé) : pour chaque enfant lancé avec une échéance de 1 ms, le retard de l'échéance après le retour de `spawn`, et si `SHA256SUMS` existait alors. Lanceur `stress.sh` (sha256 `c11d6561af34c28f…`) : `node --test --test-force-exit --test-concurrency=16 test/l2-*.test.ts`, N lanceurs sur un même `TMPDIR`.

| Arbre | Charge | Exécutions | Rouges de `l2_seal_apart_child_killed` | Échéances mesurées | Retard max | `SHA256SUMS` à l'échéance |
|---|---|---|---|---|---|---|
| base | 6 × 8 | 48 | 0 | 96 | 10,8 ms | 0 |
| base | 8 × 14 | 112 | 0 | 224 | **82,4 ms** | 0 |
| gel | 8 × 14 | 112 | **0** (112 verts) | 224 | 31,1 ms | 0 |

La queue du retard atteint le temps de scellement de l'enfant (82 ms contre environ 80 ms) : la course est réelle et rare, d'où 1 sur 48 dans l'enquête d'origine et 0 sur 160 ici. Le rouge naturel n'a pas été revu ; la preuve tient par l'élimination ci-dessus et la reproduction forcée. Au gel, la course n'a plus d'objet : l'enfant ne peut pas sceller avant d'être tué, quel que soit l'ordonnanceur.

Rouges d'autres tests pendant ces charges, hors lot : `l2_free_bytes_default` (`test/l2-record.test.ts:263`, « bavail x bsize, a few blocks apart » : l'espace libre bouge sous les écritures concurrentes) 3 + 6 + 2 fois, et `test/l2-fake-place.test.ts:78` 2 fois (base). À ouvrir en items séparés.

## Changement (test seul)

| Fichier | Ligne | Changement |
|---|---|---|
| `test/l2-loop.test.ts` | 636-637 | commentaire : la cause et la règle |
| `test/l2-loop.test.ts` | 638, 640 | `journal.jsonl` de `a` et `b` devient une FIFO (`mkfifo`, comme `l2_append_not_a_file`) que personne n'ouvre en écriture : l'enfant s'y bloque dans `journalOf` (`day.mjs:68`), avant toute écriture du jour |
| `test/l2-loop.test.ts` | 641 | `reader(o)` : ouverture `O_WRONLY \| O_NONBLOCK` de la FIFO, `ENXIO` sans lecteur |
| `test/l2-loop.test.ts` | 642-643 | attendu `[false, false, undefined, "ENXIO", "ENXIO", false, false]` : après le temps du scellement, aucun enfant ne tient sa FIFO (mort) et aucun jour n'est scellé |

Ni saut, ni nouvel essai, ni délai allongé ; le sommeil de 3 s est inchangé. Le test prouve davantage qu'avant : l'enfant est mort (sans lecteur), pas seulement « rien n'est scellé ». `APART` saute déjà ce test sous win32 ; aucun nom réservé.

## Tueur

`// killer: scripts/l2/seal.mjs:60 CONST "child?.kill(\"SIGKILL\")" -> "0"` (ligne 632, inchangée). Tiré à la main sur un clone du gel : sha256 de `seal.mjs` `e62440d823c1c28d…` avant, ligne 60 devenue `{ 0; finish(failed(stop, detail)); }`, test **rouge par assertion** (`actual: [false, false, undefined, 'a reader', 'a reader', false, false]` : les deux enfants vivants tiennent leur FIFO) ; fichier restauré, sha256 `e62440d823c1c28d…` identique.

## Oracle

- `node scripts/red-proof.mjs --base 753a23a9 --gel e3f88116 --repo . --test-only` : **OK** ; 1 test jugé, 48 inchangés ; `pinned` `l2_seal_apart_child_killed`, tueur `scripts/l2/seal.mjs:60 CONST` tiré au gel : **tué**. `RED-PROOF.json` sha256 `f053cf658d8bee22…`.
- La forme F2P (`--draw 1 --seed 37`) refuse, comme attendu pour un lot de test seul : « green at base: a self-confirming test » (le code de production est le même ; le rouge à la base n'existe que sous le forçage ci-dessus).
- `verifie-ancres.mjs . --touched origin/base/chantier-moteur-2026-10-03 HEAD` : **49 tueurs, 49 ANCRE, 0 DERIVE, 0 PERDU**.
- `npm run test:main` au gel : **2561 tests, 2539 verts, 0 échec, 22 sautés** (exit 0).
- `tsc --noEmit` vert ; `eslint .` vert ; `lint:ratchet` 69/69 ; `gate:vocab` OK ; `lang:gate` OK.
- R-25 contre `origin/base/chantier-moteur-2026-10-03` : +7/−2, **9 lignes** (sous 547), GREEN.

## Remarque pour le câblage de la boucle (hors lot, sans changement ici)

Un `seal_timeout` (ou `seal_aborted`) ne prouve pas que le jour reste non scellé : si le parent est en retard, l'enfant peut avoir fini avant l'échéance. L'en-tête de `seal.mjs` (« the day stays unsealed ») en dit plus que le code ne tient. La boucle, quand elle appellera `sealApart`, devra lire `day_sealed` au nouvel essai comme un jour déjà scellé. Proposé en item : `L2-SEAL-APART-LATE-DEADLINE-1`.
