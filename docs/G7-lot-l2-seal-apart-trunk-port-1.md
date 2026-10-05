# G7 du lot L2-SEAL-APART-TRUNK-PORT-1 : `l2_seal_apart_child_killed` au tronc, FIFO et attente bornée

- **Plan** : `docs/G0-lot-l2-seal-apart-trunk-port-1.md`. **Base** : `e4aac057` (`origin/lot/etude-suite`, refetchée). Branche `recherches/l2-seal-apart-trunk-port-1`.
- **Commits** : `32adc6d4` (G0), `d531edb6` (test, **gel**), ce G7. Hôte : Linux, Node 24.21.0, 4 cœurs, sous la charge d'autres sessions.
- **Source** : PR #175 (`L2-SEAL-APART-FLAKE-1`, base `753a23a9`, tête `f8228e4e`, fusion `babc472b`), son G0, son G7 (section « Portage au tronc ») et son G2 (R-1, R-2, N-1, N-4). Seul ce test est porté ; rien d'autre de la base.

## Cause au tronc (reproduite)

Même cause qu'à la base (G7 de #175) : l'échéance de 1 ms est un `setTimeout` du parent (`scripts/l2/seal.mjs:72`), une borne basse ; un parent non servi plus longtemps que le scellement de l'enfant le laisse lier `SHA256SUMS`. Au tronc, `halt` tue puis la fermeture rend `finish(killed ?? …)` (n-12) : `sealed: false` avec un jour scellé, assertion `:642` rouge.

### Reproduction forcée, déterministe (test seul, `--test-name-pattern`)

| Arbre | Préchargement | Courses | Résultat |
|---|---|---|---|
| tronc `e4aac057` | `force-late.cjs` (sha256 `9b6175fc1fa1cc2c…`, celui de #175 : parent tenu après le premier `spawn` jusqu'à l'enfant zombie) | 3 | **3 rouges** par assertion, `actual: [false, false, undefined, true, false]`, parent tenu 146, 222, 117 ms |
| tronc | `stall-after-arm.cjs` du G2 (sha256 `fcc96cf0897af50d…`, `STALL_ON=1`, `STALL_MS=3200`) | 3 | **3 rouges**, même tuple |
| tronc | aucun | 1 | vert |
| gel `d531edb6` (fichier de test sha256 `d2aa0132f7b4ad32…`) | `force-late.cjs` | 2 | 2 verts, parent tenu 30 000 ms (borne), `SHA256SUMS` faux |
| gel | `stall-after-arm.cjs` | 3 | 3 verts |
| gel | aucun | 2 | 2 verts (3,6 s ; 3,8 s) |

Au tronc, la course R-1 du G2 de #175 (enfant tué pas encore retiré quand `reader` passe) n'existe pas : `ends` ne se résout qu'à la fermeture des enfants, donc après leur mort.

### Charge (rouge naturel)

Lanceur `scratchpad/sat/stress.sh` (sha256 `f7d4a52eb61b60da…`) et `load.sh` (`4f9ee641c49a649b…`) : `node --test --test-force-exit --test-concurrency=16 test/l2-*.test.ts`, N lanceurs sur un même `TMPDIR`, préchargement de mesure `watch-late.cjs` (sha256 `679955c0e04a4a29…`, celui de #175). Arbres extraits par `git archive` dans le scratchpad.

| Arbre | Charge | Exécutions | `l2_seal_apart_child_killed` | Échéances de 1 ms mesurées | Retard max | `SHA256SUMS` à l'échéance | Rouges hors lot |
|---|---|---|---|---|---|---|---|
| tronc | 6 × 8 | 48 | 48 verts, **0 rouge** | 336 | 246,2 ms | 0 | `l2_free_bytes_default` ×1 |
| tronc | 8 × 14 | 112 | 112 verts, **0 rouge** | 784 | 830,0 ms | 0 | `l2_seal_apart_root_deleted` ×1 |
| gel | 8 × 14 | 112 | 112 verts | 784 | 380,0 ms | 0 | `l2_free_bytes_default` ×4, `l2_seal_apart_as_in_process` ×1 |
| gel | 6 × 8 | 48 | 48 verts | 336 | 181,0 ms | 0 | `l2_free_bytes_default` ×2 |

Comme à la base (0 sur 160 dans le G7 de #175), le rouge naturel n'a pas été revu en 160 exécutions au tronc : la course est rare (1 sur 48 dans l'enquête d'origine). Les retards mesurés dépassent ici le temps de scellement, mais aucune échéance n'a trouvé `SHA256SUMS` : le préchargement compte toutes les minuteries de 1 ms armées juste après un `spawn` de `seal-child`, y compris celles d'autres tests et celles où l'enfant n'avait pas encore fini. La preuve tient par la reproduction forcée ci-dessus. Au gel, l'enfant ne peut pas sceller avant d'être tué, quel que soit le retard du parent.

## Changement (test seul)

| Fichier | Ligne | Changement |
|---|---|---|
| `test/l2-loop.test.ts` | 637 | saut : `APART \|\| (process.platform === "win32" ? "no FIFO on win32" : false)` (comme #175, N-1) |
| `test/l2-loop.test.ts` | 639-642 | commentaire : la cause et la règle de #175 ; propre au tronc, l'attente bornée et la libération des FIFO |
| `test/l2-loop.test.ts` | 643, 645 | `journal.jsonl` de `a` et `b` devient une FIFO (`mkfifo`) : l'enfant s'y bloque dans `journalOf` (`day.mjs:68`), avant toute écriture du jour |
| `test/l2-loop.test.ts` | 646 | `reader(o)` : ouverture `O_WRONLY \| O_NONBLOCK`, `ENXIO` sans lecteur (comme #175) |
| `test/l2-loop.test.ts` | 647-649 | `ends = Promise.all([...])`, puis `ac.abort()` (comme #175) ; `bound`, la minuterie de la borne |
| `test/l2-loop.test.ts` | 651 | **tronc** : `Promise.race` entre les deux `sealed` et une borne de 10 s qui rend `["pending", "pending"]` |
| `test/l2-loop.test.ts` | 652-654 | le sommeil de 3 s armé après les appels ; attendu `[false, false, undefined, "ENXIO", "ENXIO", false, false]` (comme #175) |
| `test/l2-loop.test.ts` | 655 | **tronc** : `finally` qui efface la borne et ouvre puis ferme chaque FIFO : un enfant vivant lit EOF et sort |

Ni nouvel essai, ni délai du test allongé (3 s inchangées) ; la borne de 10 s ne joue que si un enfant survit. Aucune ligne de production. `join` pour les chemins, aucun nom réservé, un seul saut nommé sous win32 (le test l'était déjà par `APART`).

## Tueur

`// killer: scripts/l2/seal.mjs:60 CONST "child?.kill(\"SIGKILL\")" -> "0"` (ligne 636, inchangée, juste au-dessus de `test(`). Tiré à la main dans le worktree, au gel :

- sha256 de `seal.mjs` avant : `c69a757fe18010112e97eeb5a158435413e7157cc9d822ee18c3d6d3ff619231` ; ligne 60 devenue `… } 0; };` ;
- `node --test --test-force-exit --test-name-pattern='^l2_seal_apart_child_killed$' test/l2-loop.test.ts` : **rouge par assertion** en 13,6 s (borne de 10 s + 3 s), `fail 1`, `cancelled 0`, `actual: ['pending', 'pending', undefined, 'a reader', 'a reader', false, false]` (les deux enfants vivants tiennent leur FIFO) ;
- fichier restauré, sha256 `c69a757f…` identique ; `git status` : seul le test (alors non commité) modifié ;
- **aucun `seal-child` du worktree restant** (`ps`) : l'ouverture puis la fermeture de `reader` les ont libérés. Sans ce lot (test de #175 porté tel quel), le G2 de #175 mesurait un test pendant jusqu'à `--test-timeout`, `cancelled`, et deux orphelins.

## Oracle

- `node scripts/red-proof.mjs --test-only --base e4aac057 --gel d531edb6 --repo .` : **OK** ; 1 test jugé, 90 inchangés ; `pinned` `l2_seal_apart_child_killed`, tueur `scripts/l2/seal.mjs:60 CONST` tiré au gel : **tué**. `RED-PROOF.json` sha256 `218e31b0f781a69a…`. Durée 1 min 41 s.
- La forme demandée `--test-only … --draw n --seed 37` est refusée par l'usage du script (`--draw <n> --seed <integer> | --test-only` sont exclusifs) ; la forme F2P `--draw 1 --seed 37` refuse, comme attendu pour un lot de test seul : « green at base: a self-confirming test » (le rouge au tronc n'existe que sous forçage).
- `verifie-ancres.mjs . --touched e4aac057 HEAD` : **91 tueurs, 91 ANCRE, 0 DERIVE, 0 PERDU**.
- R-25 contre `e4aac057` : `mode unproven`, +17/−4, **21 lignes** (borne demandée 547 ; borne du `ci.yml` du tronc 1205), contenu 0, **GREEN**.
- `npm run test:main` au gel : **2485 tests, 2463 verts, 0 échec, 0 annulé, 22 sautés** (exit 0). `test/l2-loop.test.ts` seul, 3 fois : 91/91 chaque fois ; aucun `seal-child` restant.
- `tsc --noEmit` vert ; `eslint .` vert ; `lint:ratchet` 69/69 ; `gate:vocab` OK (335 fichiers) ; `lang:gate` OK.

## Restes (hors lot, options et prix)

1. **Conflit à la fusion base -> tronc.** Les deux branches changent le même test différemment (#175 à la base, ce lot au tronc). Option A (défaut) : à la fusion, garder la version du tronc (elle contient celle de #175 plus la borne et le `finally`) ; prix nul, une résolution de conflit d'un bloc. Option B : porter la borne et le `finally` aussi à la base ; un lot de test d'environ 6 lignes, inutile tant que la base garde l'ancien `halt`.
2. **`l2_seal_apart_root_deleted`** (`test/l2-loop.test.ts:620`) rouge 1 fois sur 112 au tronc sous charge 8 × 14 : `seal_timeout` au lieu de `out_not_l2`, l'enfant n'a pas atteint sa garde en 5 s. Même famille (échéance du test contre ordonnanceur). Item proposé `L2-SEAL-APART-ROOT-DELETED-FLAKE-1` ; prix : un lot de test seul, à mesurer (allonger l'échéance ou la rendre indépendante du démarrage).
3. **`l2_seal_apart_as_in_process`** (`:389`) rouge 1 fois sur 112 au gel sous charge : l'enfant voit un descripteur en trop (`extra: [22]`, `out_not_l2`). Ce test s'exécute avant `l2_seal_apart_child_killed` dans le fichier (ordre vérifié dans le journal de la course) : sans lien avec ce lot. Probablement un descripteur hérité d'un autre `spawn` concurrent du même processus. Item proposé `L2-SEAL-APART-FD-LEAK-1` ; prix : une enquête, puis un lot.
4. **`l2_free_bytes_default`** (`test/l2-record.test.ts`) : 1 + 4 + 2 rouges sous charge, déjà signalé par le G7 de #175.
5. **`L2-SEAL-APART-LATE-DEADLINE-1`** (G7 de #175) vaut aussi au tronc : un `seal_timeout` peut couvrir un jour déjà scellé. Inchangé ici.
6. Un `seal-child` orphelin (ppid 1) d'un ancien `red-proof` du lot de la base (`scratchpad/sf/tmp-rp/red-proof-vOb11M`) tourne encore ; il n'est pas de ce lot et n'a pas été tué.
