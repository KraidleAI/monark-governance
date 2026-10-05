# G7 du lot L2-SEAL-APART-TRUNK-PORT-1 : `l2_seal_apart_child_killed` au tronc, FIFO et attente bornée

- **Plan** : `docs/G0-lot-l2-seal-apart-trunk-port-1.md`. **Base** : `e4aac057` (`origin/lot/etude-suite`, refetchée). Branche `recherches/l2-seal-apart-trunk-port-1`.
- **Commits** : `32adc6d4` (G0), `d531edb6` (test, premier gel), `b672c5bb` (G7) ; puis, après le G2 frais (non bloquant) : `059bd1a2` (test : arrêt vérifié, constat 3), `2c007d13` (correctif : attente des enfants libérés, constat 1 ; **gel**), et cette reprise du G0 et du G7. Hôte : Linux, Node 24.21.0, 4 cœurs, sous la charge d'autres sessions.
- **Source** : PR #175 (`L2-SEAL-APART-FLAKE-1`, base `753a23a9`, tête `f8228e4e`, fusion `babc472b`), son G0, son G7 (section « Portage au tronc ») et son G2 (R-1, R-2, N-1, N-4). Seul ce test est porté ; rien d'autre de la base.
- **Fichier de test au gel** : `test/l2-loop.test.ts` sha256 `dfa84a7ca6b6c6d04dea9fbfc45e7f4dd24e993496f05f05d099b17b5de8d4e7` (premier gel `d531edb6` : `d2aa0132f7b4ad32…`).

## Fusion T0 (instruction prête à coller)

> En fusionnant `base/chantier-moteur-2026-10-03` dans `lot/etude-suite` après ce lot, `test/l2-loop.test.ts` est en conflit, en deux blocs, tous deux dans `l2_seal_apart_child_killed` (le commentaire, puis le corps). **Garder le côté tronc** pour les deux blocs (`git checkout --ours test/l2-loop.test.ts`). Après résolution, le fichier doit être octet pour octet celui de ce lot : sha256 `dfa84a7ca6b6c6d04dea9fbfc45e7f4dd24e993496f05f05d099b17b5de8d4e7`, et `git diff <tête de ce lot> HEAD -- test/l2-loop.test.ts` vide. Rien de la base n'est perdu : la version de #175 y est contenue (FIFO, `reader`, sommeil armé après les appels, saut win32) ; s'y ajoutent la borne de 10 s, l'arrêt vérifié et le `finally` qui libère puis attend les enfants. La version de la base est fausse sur le `seal.mjs` actuel (n-12, présent à la base depuis `7a0d8ef4`) : sous son tueur, elle pend jusqu'à `--test-timeout` et laisse deux orphelins. Si l'ordre s'inverse (base fusionnée au tronc avant ce lot), la première fusion est propre et sans signal ; la fusion de ce lot entre alors en conflit sur les mêmes blocs : garder le côté du lot (`--theirs`), même sha256 attendu.

## Cause au tronc (reproduite)

Même cause qu'à la base (G7 de #175) : l'échéance de 1 ms est un `setTimeout` du parent (`scripts/l2/seal.mjs:72`), une borne basse ; un parent non servi plus longtemps que le scellement de l'enfant le laisse lier `SHA256SUMS`. Au tronc, `halt` tue puis la fermeture rend `finish(killed ?? …)` (n-12) : `sealed: false` avec un jour scellé, assertion `:642` rouge.

### Reproduction forcée, déterministe (test seul, `--test-name-pattern`)

| Arbre | Préchargement | Courses | Résultat |
|---|---|---|---|
| tronc `e4aac057` | `force-late.cjs` (sha256 `9b6175fc1fa1cc2c…`, celui de #175 : parent tenu après le premier `spawn` jusqu'à l'enfant zombie) | 3 | **3 rouges** par assertion, `actual: [false, false, undefined, true, false]`, parent tenu 146, 222, 117 ms |
| tronc | `stall-after-arm.cjs` du G2 de #175 (sha256 `fcc96cf0897af50d…`, `STALL_ON=1`, `STALL_MS=3200`) | 3 | **3 rouges**, même tuple |
| tronc | aucun | 1 | vert |
| premier gel `d531edb6` | `force-late.cjs` | 2 | 2 verts, parent tenu 30 000 ms (borne), `SHA256SUMS` faux |
| premier gel | `stall-after-arm.cjs` | 3 | 3 verts |
| premier gel | aucun | 2 | 2 verts (3,6 s ; 3,8 s) |
| gel `2c007d13` | `force-late.cjs` | 2 | 2 verts, parent tenu 30 000 ms (borne), `SHA256SUMS` faux |

Au tronc, la course R-1 du G2 de #175 (enfant tué pas encore retiré quand `reader` passe) n'existe pas : `ends` ne se résout qu'à la fermeture des enfants, donc après leur mort.

### Charge (rouge naturel), mesurée au premier gel

Lanceur `scratchpad/sat/stress.sh` (sha256 `f7d4a52eb61b60da…`) et `load.sh` (`4f9ee641c49a649b…`) : `node --test --test-force-exit --test-concurrency=16 test/l2-*.test.ts`, N lanceurs sur un même `TMPDIR`, préchargement de mesure `watch-late.cjs` (sha256 `679955c0e04a4a29…`, celui de #175). Arbres extraits par `git archive` dans le scratchpad.

| Arbre | Charge | Exécutions | `l2_seal_apart_child_killed` | Échéances de 1 ms mesurées | Retard max | `SHA256SUMS` à l'échéance | Rouges hors lot |
|---|---|---|---|---|---|---|---|
| tronc | 6 × 8 | 48 | 48 verts, **0 rouge** | 336 | 246,2 ms | 0 | `l2_free_bytes_default` ×1 |
| tronc | 8 × 14 | 112 | 112 verts, **0 rouge** | 784 | 830,0 ms | 0 | `l2_seal_apart_root_deleted` ×1 |
| premier gel | 8 × 14 | 112 | 112 verts | 784 | 380,0 ms | 0 | `l2_free_bytes_default` ×4, `l2_seal_apart_as_in_process` ×1 |
| premier gel | 6 × 8 | 48 | 48 verts | 336 | 181,0 ms | 0 | `l2_free_bytes_default` ×2 |

Comme à la base (0 sur 160 dans le G7 de #175), le rouge naturel n'a pas été revu en 160 exécutions au tronc : la course est rare (1 sur 48 dans l'enquête d'origine). Les retards mesurés dépassent ici le temps de scellement, mais aucune échéance n'a trouvé `SHA256SUMS` : le préchargement compte toutes les minuteries de 1 ms armées juste après un `spawn` de `seal-child`, y compris celles d'autres tests et celles où l'enfant n'avait pas encore fini. La preuve tient par la reproduction forcée ci-dessus. Au gel, l'enfant ne peut pas sceller avant d'être tué, quel que soit le retard du parent. La reprise du G2 ne touche que le chemin du tueur et l'assertion des arrêts ; la charge n'a pas été refaite.

## Changement (test seul)

| Fichier | Ligne | Changement |
|---|---|---|
| `test/l2-loop.test.ts` | 637 | saut : `APART \|\| (process.platform === "win32" ? "no FIFO on win32" : false)` (comme #175, N-1) |
| `test/l2-loop.test.ts` | 639-644 | commentaire : la cause et la règle de #175 ; propre au tronc, l'attente bornée, la libération puis l'attente des enfants, l'arrêt vérifié |
| `test/l2-loop.test.ts` | 645, 647 | `journal.jsonl` de `a` et `b` devient une FIFO (`mkfifo`) : l'enfant s'y bloque dans `journalOf` (`day.mjs:68`), avant toute écriture du jour |
| `test/l2-loop.test.ts` | 648 | `reader(o)` : ouverture `O_WRONLY \| O_NONBLOCK`, `ENXIO` sans lecteur (comme #175) |
| `test/l2-loop.test.ts` | 649-651 | `ends = Promise.all([...])`, puis `ac.abort()` (comme #175) ; `bound`, la minuterie de la borne |
| `test/l2-loop.test.ts` | 653 | **tronc** : `Promise.race` entre l'arrêt de chaque appel (`failed.stop`, sinon `sealed`) et une borne de 10 s qui rend `["pending", "pending"]` |
| `test/l2-loop.test.ts` | 654-656 | le sommeil de 3 s armé après les appels ; attendu `["seal_timeout", "seal_aborted", undefined, "ENXIO", "ENXIO", false, false]` |
| `test/l2-loop.test.ts` | 657-661 | **tronc** : `finally` qui efface la borne, ouvre puis ferme chaque FIFO (un enfant vivant lit EOF), puis attend la fermeture des deux enfants, 5 s au plus, avant le `rmSync` du crochet `after` |

Ni nouvel essai, ni délai du test allongé (3 s inchangées) ; la borne de 10 s et l'attente de 5 s ne jouent que si un enfant survit. Aucune ligne de production. `join` pour les chemins, aucun nom réservé, un seul saut nommé sous win32 (le test l'était déjà par `APART`).

## Tueurs

Préchargement `scratchpad/sat/spawnlog.cjs` (sha256 `b71e0d481970153…`, celui du G2 : journal des PID des `seal-child`, rien d'autre) ; lanceur `one.sh` (sha256 `b7b570035c360cee…`) : une exécution, 3 s d'attente, puis `reap.sh` (sha256 `edf2aff9a3f1ea36…`) liste les PID journalisés encore vivants dont la ligne de commande est le `seal-child` de l'arbre, et les tue par PID exact. Chaque mutation tirée dans le worktree, `seal.mjs` restauré, sha256 `c69a757fe18010112e97eeb5a158435413e7157cc9d822ee18c3d6d3ff619231` vérifié identique après chaque série.

1. **Listé** : `// killer: scripts/l2/seal.mjs:60 CONST "child?.kill(\"SIGKILL\")" -> "0"` (ligne 636, inchangée, juste au-dessus de `test(`).

| Arbre | Charge | Courses | Résultat | `seal-child` vivants 3 s après |
|---|---|---|---|---|
| premier gel `d531edb6` | aucune | 1 | rouge par assertion, 13,6 s | 0 (contrôle `ps`, un seul tirage : trop faible, voir le constat 1 du G2) |
| `059bd1a2` (avant le correctif) | aucune | 10 | 10 rouges, 16,3 s | 0 |
| `059bd1a2` (avant le correctif) | 6 boucles CPU (mes PID, arrêtées par PID) | 6 | 6 rouges, 16,5 s | **3** (état R, ppid 1, 100 % CPU) → tués par PID exact (7578, 7751, 7944) |
| gel `2c007d13` | 6 boucles CPU | 6 | **6 rouges** par assertion, 16,6 s, `actual: ['pending', 'pending', undefined, 'a reader', 'a reader', false, false]`, 0 annulé | **0** |
| gel | aucune, sans tueur | 5 + 6 | 11 verts, 6,3 s (lanceur compris) | 0 |

Le G2 a mesuré 6 orphelins sur 10 au premier gel. La première version de ce G7 disait « aucun `seal-child` du worktree restant » d'après un seul contrôle `ps` : c'était faux.

2. **Tiré à la main, non listé** (le dépôt n'empile jamais deux lignes `// killer:` au-dessus d'un `test(`) : `scripts/l2/seal.mjs:71` `spawn(process.execPath,` -> `spawn("/nonexistent/node",` (l'enfant ne démarre jamais).

| Arbre | Résultat |
|---|---|
| premier gel `d531edb6` (copie `git archive`) | **vert** : `sealed` faux, `ENXIO` sans enfant, pas de `SHA256SUMS` (faiblesse du test, antérieure au lot : constat 3 du G2) |
| `059bd1a2` | **rouge par assertion**, `actual: ['spawn_failed', 'seal_aborted', undefined, 'ENXIO', 'ENXIO', false, false]` ; 0 `seal-child` vivant |
| gel `2c007d13` | **rouge par assertion**, même tuple ; 0 `seal-child` vivant |

Sans tueur, l'arrêt vérifié est déterministe : 5 verts sur 5 à `059bd1a2`, puis 11 au gel (l'enfant est tenu sur sa FIFO, tué par l'échéance ou par l'abandon).

## Oracle (au gel `2c007d13`)

- `node scripts/red-proof.mjs --test-only --base e4aac057 --gel 2c007d13 --repo .` : **OK** ; 1 test jugé, 90 inchangés ; `pinned` `l2_seal_apart_child_killed`, tueur `scripts/l2/seal.mjs:60 CONST` tiré au gel : **tué**. `RED-PROOF.json` sha256 `f23aa00b076cf9dd…` (premier gel `d531edb6` : OK aussi, `218e31b0f781a69a…`). Aucun `seal-child` restant de ses arbres temporaires.
- La forme demandée `--test-only … --draw n --seed 37` est refusée par l'usage du script (`--draw <n> --seed <integer> | --test-only` sont exclusifs) ; la forme F2P `--draw 1 --seed 37` refuse au premier gel, comme attendu pour un lot de test seul : « green at base: a self-confirming test » (le rouge au tronc n'existe que sous forçage).
- `verifie-ancres.mjs . --touched e4aac057 HEAD` : **91 tueurs, 91 ANCRE, 0 DERIVE, 0 PERDU**.
- R-25 contre `e4aac057` : `mode unproven`, +23/−4, **27 lignes** (borne demandée 547 ; borne du `ci.yml` du tronc 1205), contenu 0, **GREEN**.
- `npm run test:main` au gel : **2485 tests, 2463 verts, 0 échec, 0 annulé, 22 sautés** (exit 0). `test/l2-loop.test.ts` seul, 3 fois : 91/91 chaque fois.
- `tsc --noEmit` vert ; `eslint .` vert ; `lint:ratchet` 69/69 ; `gate:vocab` OK (335 fichiers) ; `lang:gate` OK.

## Reprise du G2 (frais, non bloquant)

| Constat | Décision | Changement | Preuve |
|---|---|---|---|
| 1. Sous le tueur, l'enfant libéré par le `finally` n'est pas attendu : `after()` supprime `ROOT`, l'enfant tourne sans fin dans `mkdirSync` récursif (`day.mjs:194`) : orphelin, 100 % CPU | repris | `finally` : `await Promise.race([ends.catch(() => undefined), sommeil de 5 s])`, puis `clearTimeout` (`2c007d13`) ; phrases « aucun orphelin » corrigées au G0 (règle 4, tueurs), au commentaire du test et ici (section Tueurs) | avant : 3 orphelins sur 6 sous charge (G2 : 6 sur 10) ; après : 6 rouges, 0 orphelin ; sans tueur 11 verts |
| 2. Reste 1, option B, faux : depuis `7a0d8ef4` la base a le `seal.mjs` du tronc (n-12) | repris | reste 1 réécrit (ci-dessous) ; instruction T0 ajoutée (en tête) | G2 : base `789f6511` sous le tueur, `cancelled`, 2 orphelins |
| 3. Le test passe si l'enfant ne démarre jamais | repris | l'assertion vérifie l'arrêt de chaque appel : `["seal_timeout", "seal_aborted", …]` (`059bd1a2`) | mutation `spawn` -> `/nonexistent/node` : vert au premier gel, rouge ensuite ; sans tueur 16 verts sur 16 |
| 4. Faux rouge si le parent est figé plus de 10 s juste après l'armement de la borne | note | aucun | voir Notes |
| 5. Le `finally` ne peut ni pendre ni masquer l'échec | note | aucun (l'attente ajoutée est bornée à 5 s et `ends` ne rejette jamais ; `.catch` par garde) | voir Notes |
| 6. Windows | note | aucun | voir Notes |
| 7. Documents et hygiène | repris en partie | phrases fausses corrigées (constats 1 et 2) | — |
| 8. Rouges hors lot | note | aucun | voir Restes |

## Notes du G2

- **N-4 (borne de 10 s)** : un parent figé plus de 10 s juste après l'armement de la borne donne un faux rouge `['pending', 'pending', …]` (enfants morts, 0 orphelin) ; 9 s : vert. Bien au-delà des retards mesurés sous charge (830 ms au plus). Prix si on le voit : borne à 30 s, test sous tueur à environ 36 s.
- **N-5 (`finally`)** : `reader` ouvre en `O_WRONLY | O_NONBLOCK` : jamais bloquant ; toute erreur est captée par `codeOf`. `clearTimeout(undefined)` ne lève rien. L'attente ajoutée est bornée à 5 s. Un `mkfifo` en échec lève avant le `try`. Cas limite non observé : un enfant qui n'a pas encore ouvert sa FIFO au passage du `finally` (démarrage de plus de 13 s) n'est pas libéré ; l'attente de 5 s ne le couvre pas.
- **N-6 (Windows)** : `APART` est une chaîne non vide sous win32, donc `APART || (…)` saute déjà avec la raison d'`APART` ; la branche `"no FIFO on win32"` n'est jamais atteinte (même forme que #175). `mkfifo`, `O_NONBLOCK` et `spawnSync` ne s'exécutent que dans le corps sauté.
- **N-7 (documents)** : la parenthèse de #175 sur le sommeil armé après les appels manque au commentaire ; son sens reste dans « 3 s after both calls end ».
- **N-8 (rouges hors lot)** : `l2_seal_apart_root_deleted` et `l2_seal_apart_as_in_process` sont antérieurs au lot et sans rapport (voir Restes). Piste du G2 pour le premier : la même boucle de `mkdirSync` récursif donne `seal_timeout` si l'enfant n'a pas atteint sa garde `seal-child.mjs:26` avant l'échéance de 5 s.

## Restes (hors lot, options et prix)

1. **Conflit à la fusion base -> tronc (T0).** Résolu par l'instruction en tête : garder le côté tronc, sha256 `dfa84a7c…`. La base, depuis `7a0d8ef4`, a le `seal.mjs` du tronc (n-12) : la version de #175 y est déjà fausse sous son tueur (pendante jusqu'à `--test-timeout`, 2 orphelins). Option : si la base doit encore servir de base de lots avant T0, y porter ce test (un lot de test seul, environ 25 lignes R-25) ; sinon rien, T0 la remplace. Défaut : rien.
2. **`l2_seal_apart_root_deleted`** (`test/l2-loop.test.ts:620`) rouge 1 fois sur 112 au tronc sous charge 8 × 14 : `seal_timeout` au lieu de `out_not_l2`. Item proposé `L2-SEAL-APART-ROOT-DELETED-FLAKE-1` ; prix : un lot de test seul, à mesurer.
3. **`l2_seal_apart_as_in_process`** (`:389`) rouge 1 fois sur 112 au premier gel sous charge : l'enfant voit un descripteur en trop (`extra: [22]`, `out_not_l2`). Ce test s'exécute avant `l2_seal_apart_child_killed` dans le fichier : sans lien avec ce lot. Item proposé `L2-SEAL-APART-FD-LEAK-1` ; prix : une enquête, puis un lot.
4. **`l2_free_bytes_default`** (`test/l2-record.test.ts`) : 1 + 4 + 2 rouges sous charge, déjà signalé par le G7 de #175.
5. **`L2-SEAL-APART-LATE-DEADLINE-1`** (G7 de #175) vaut aussi au tronc : un `seal_timeout` peut couvrir un jour déjà scellé. Inchangé ici.
6. Un `seal-child` orphelin (ppid 1) d'un ancien `red-proof` du lot de la base (`scratchpad/sf/tmp-rp/red-proof-vOb11M`) tournait encore au premier G7 ; il n'est pas de ce lot et n'a pas été tué.
