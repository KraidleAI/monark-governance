# G7 du lot L2-FLAKES-2 : `l2_free_bytes_default` et le test muet de la fausse place ne dépendent plus de l'hôte

- **Plan** : `docs/G0-lot-l2-flakes-2.md`. **Base** : `753a23a9` (`origin/base/chantier-moteur-2026-10-03`). Branche `recherches/l2-flakes-2`.
- **Commits** : `5d4129fb` (G0), `44023467` (test ; **gel**), puis ce G7, puis le pli de la G2 (R-1, N-1, N-2 ; section « Pli de la G2 »). Hôte : Linux, Node 24.21.0, 4 cœurs, sous la charge d'autres sessions.
- **Sous-items** : `L2-FREE-BYTES-FLAKE-1`, `L2-FAKE-PLACE-FLAKE-1`. Les deux fautes sont dans les tests ; aucune ligne de production ne bouge.

## L2-FREE-BYTES-FLAKE-1 : cause (prouvée)

À la base, le test lit `s = statfsSync(ROOT)` puis `freeBytes(join(ROOT, "absent", "x"))` (qui lit `statfsSync(ROOT)` à son tour, `scripts/record-binance-l2.mjs:161-163`) et exige `|got - s.bavail × s.bsize| <= 64 × s.bsize`. Les deux lectures portent sur le même système de fichiers, à deux instants : tout écrivain concurrent sur ce disque change `bavail` entre elles. Le code fait ce que son contrat dit ; l'hypothèse du test (« deux lectures réelles diffèrent d'au plus 64 blocs ») est fausse.

### Reproduction forcée, déterministe

Préchargement `statfs-drift.cjs` (sha256 `68b2ba2754846174…`, scratchpad, hors dépôt, par `-r`) : chaque appel de `fs.statfsSync` rend `bavail` diminué de 65 × k blocs (k = rang de l'appel), puis `syncBuiltinESMExports()` ; il simule un écrivain de 65 blocs entre deux lectures. Variante à 64 blocs pour la borne.

| Arbre | Forçage | Résultat |
|---|---|---|
| base `753a23a9` | 65 blocs | **rouge par assertion**, « bavail x bsize, a few blocks apart » (le message observé), 3 sur 3 |
| base | 64 blocs | vert, 3 sur 3 (la tolérance du test, exactement) |
| gel `44023467` | 65 blocs, fichier entier | vert (21 sur 21) : le test ne compare plus deux lectures réelles |

### Reproduction naturelle

Un écrivain concurrent (écrit puis efface un fichier de 4 Mio en boucle, sur le même disque, sous le `TMPDIR` de l'essai), le test seul 40 fois :

| Arbre | Écrivain | Rouges |
|---|---|---|
| base | oui | **19 / 40** |
| base | non | 0 / 40 |
| gel | oui | 0 / 40 |

### Changement

| Fichier | Ligne | Changement |
|---|---|---|
| `test/l2-record.test.ts` | 11-12 | `statfsSync` ne s'importe plus ; `createRequire`, `syncBuiltinESMExports` de `node:module` |
| `test/l2-record.test.ts` | 22-23 | `fs` : l'objet CommonJS de `node:fs` (motif de `test/l2-loop.test.ts:363`) |
| `test/l2-record.test.ts` | 266-274 | la lecture réelle ne vérifie plus que le type (`number`) ; puis `statfsSync` remplacé rend `bsize` 512, `bavail` 7, `bfree` 11, `blocks` 13 et note le chemin lu ; attendu `[3584, [ROOT]]` ; restauré dans `finally` |

Limite (N-2 de la G2) : sur la lecture réelle, seul le type est vérifié ; le chemin et le produit le sont sur le bouchon, et aucune mutation plausible de `freeBytes` ne survit à ce couple. Le test prouve davantage qu'avant : le produit exact `bavail × bsize` (et non `bfree`, ni `blocks`), et le chemin exact de l'ancêtre lu. Windows : `join`, `dirname` deux fois rend `ROOT` tel quel ; aucun saut.

## L2-FAKE-PLACE-FLAKE-1 : cause (prouvée)

À la base, après `s.ws.close(1000)`, le test attend `wait(200)` puis exige `[s.codes, peer.got ops] = [[], [8]]`. Le rouge observé `[[], []]` dit que la CLOSE du client n'était pas encore lue par la place. La trame part tout de suite sur la boucle locale ; la place ne la lit qu'à la prochaine phase des entrées-sorties. Si le processus n'est pas servi plus de 200 ms avant elle, la minuterie a expiré, et libuv passe la phase des minuteries avant celle des entrées-sorties : l'assertion lit `peer.got` vide. Délai fixe pris pour une synchronisation ; le code de la place (`test/l2-fake-place.ts`) est juste.

### Reproduction forcée, déterministe

Préchargement `stall-after-close.cjs` (sha256 `ab2d8b09f7769b2c…`) : `WebSocket.prototype.close` appelle l'original puis, par `setImmediate` (phase de contrôle, avant la prochaine phase des entrées-sorties), tient le processus 300 ms (`Atomics.wait`) ; il simule un processus non servi. Variante à 150 ms.

| Arbre | Forçage | Résultat |
|---|---|---|
| base | 300 ms | **rouge par assertion**, `actual: [ [], [] ]` (le tuple observé, exactement) |
| base | 150 ms | vert (1 sur 1) |
| gel | 300 ms, fichier entier | vert (8 sur 8) |

### Changement

| Fichier | Ligne | Changement |
|---|---|---|
| `test/l2-fake-place.test.ts` | 81-84 | `await wait(200)` devient `await until(() => (peer?.got.length ?? 0) === 1)` suivi de `await wait(200)` (pli R-1 de la G2) ; commentaire : la cause et la règle |

`until` compte ses tours (300 × 10 ms), et chaque tour rend la main à la phase des entrées-sorties : la trame est lue dès qu'elle est là. La coupure qui suit (`peer.cut()`, attendu `[1006]`) sépare une place muette d'une place qui aurait répondu (1000), quel que soit l'ordonnanceur.

## Tueurs (inchangés), tirés à la main au gel

- `scripts/record-binance-l2.mjs:161 SDL "while (!existsSync(p) && dirname(p) !== p) p = dirname(p);" -> ""` : sha256 `791b7facc5ebab46…` avant ; ligne vidée ; `l2_free_bytes_default` **rouge par assertion** (« an absent output reads its nearest existing ancestor », `actual: 'string'` : `ENOENT`) ; restauré, sha256 identique.
- `test/l2-fake-place.ts:78 CONST "muted = true" -> "muted = false"` : sha256 `a5dcf4afdd94da4d…` avant ; le test **rouge par assertion 10 sur 10** sans forçage (`actual: [ [ 1000 ], [ 8 ] ]` : la place a répondu) et **5 sur 5** sous le forçage de 300 ms (`actual: [ 1000 ]` à l'assertion finale) ; restauré, sha256 identique.

## Charge avant et après

Lanceur `stress.sh` (sha256 `8292939efae6f31f…`) : `node --test --test-force-exit --test-concurrency=16 test/l2-*.test.ts`, 8 lanceurs × 14 exécutions, un même `TMPDIR` par phase ; arbres extraits par `git archive` (base, gel), mêmes `node_modules`.

| Arbre | Exécutions | Vertes | `l2_free_bytes_default` | `fake_place_mute_…` | Autres |
|---|---|---|---|---|---|
| base | 112 | 107 | **4** | **1** | `l2_seal_apart_child_killed` 1 (item `L2-SEAL-APART-FLAKE-1`, autre lot) |
| gel | 112 | **112** | 0 | 0 | 0 |

## Hors du banc : la CI réelle

- **Espace libre** : le `TMPDIR` partagé n'y est pour rien ; c'est le disque partagé. Les `TMPDIR` des lanceurs sont sur le même disque, et une exécution `npm run test:main` en CI (runner Linux ou Windows, sans `TMPDIR` partagé) lance ses fichiers en parallèle sur le disque du runner, dont plusieurs écrivent des mégaoctets (segments, jours scellés). Un écart de 65 blocs entre deux lectures y est possible, plus rare. Vraie dépendance à l'environnement : corrigée.
- **Fausse place** : boucle locale seule, sans fichier ; il faut un processus non servi plus de 200 ms entre `close()` et la lecture. Possible sur un runner chargé (Windows plus lent, ramasse-miettes, fichiers en parallèle), rare. Vraie dépendance au temps : corrigée.

## Oracle

- `node scripts/red-proof.mjs --base 753a23a9 --gel 44023467 --repo . --test-only` : **OK** ; 2 tests jugés, 27 inchangés ; `pinned` les deux ; tueurs `scripts/record-binance-l2.mjs:161 SDL` et `test/l2-fake-place.ts:78 CONST` tirés au gel : **tués**. `RED-PROOF.json` sha256 `6b4af54b50c2bf41…`.
- La forme F2P (`--draw 1 --seed 37`) refuse, comme attendu pour un lot de test seul : « green at base: a self-confirming test » pour les deux (le rouge à la base n'existe que sous charge ou sous les forçages ci-dessus).
- `verifie-ancres.mjs . --touched origin/base/chantier-moteur-2026-10-03 HEAD` : **29 tueurs, 29 ANCRE, 0 DERIVE, 0 PERDU**.
- `npm run test:main` au gel : **2561 tests, 2539 verts, 0 échec, 22 sautés** (exit 0).
- `tsc --noEmit` vert ; `eslint .` vert ; `lint:ratchet` 69/69 ; `gate:vocab` OK ; `lang:gate` OK.
- R-25 contre `origin/base/chantier-moteur-2026-10-03` : +15/−5, **20 lignes** au gel, GREEN. Plafond du lot : 547 (notre règle) ; plafond de la PR affiché par l'oracle : 1205 (`VIBEGATES_PR_LIMIT`). Après le pli : voir ci-dessous.

## Pli de la G2 (APPROUVÉ, une réserve)

- **R-1** (`a9d51b27`) : après `until(...)`, `await wait(200)` est rétabli. Une place muette correcte n'émet rien, donc cette attente ne peut pas recréer la flake ; elle rend la fenêtre de silence de 200 ms. Mutant de la G2 (place muette qui répond 50 ms plus tard : `|| muted` retiré à `test/l2-fake-place.ts:85`, réponse par `setTimeout(…, muted ? 50 : 0)`) : avant le pli **survit 3/3** ; après le pli **tué 3/3** (`actual: [ [ 1000 ], [ 8 ] ]`) ; fichier restauré, sha256 `a5dcf4afdd94da4d…` identique. Tueur déclaré (`:78`) : tué 5/5. Préchargement de 300 ms : fichier vert 3/3.
- **Charge après le pli** : les deux fichiers 10 fois seuls, 0 rouge ; 6 lanceurs × 8 exécutions des deux fichiers, `--test-concurrency=16`, avec un écrivain concurrent de 8 Mio en boucle sur le même disque : **48/48 verts** (29 tests chacune).
- **N-1** : la borne R-25 est dite correctement dans le G0 et ici : plafond du lot 547 (notre règle), plafond de la PR 1205 (`VIBEGATES_PR_LIMIT`, affiché par l'oracle).
- **N-2** : une ligne sous le changement de `l2_free_bytes_default`.
- **Vérifications au pli** : base inchangée (`753a23a9`). `npm run test:main` : 2561 tests, 2539 verts, 0 échec, 22 sautés. `tsc`, `eslint` verts ; `lint:ratchet` 69/69 ; `gate:vocab`, `lang:gate` OK ; ancres 29/29 ANCRE ; `red-proof --test-only --gel a9d51b27` OK (2 `pinned`, 2 tueurs tués, `RED-PROOF.json` sha256 `37fd711088c2f13d…`) ; R-25 +15/−4, **19 lignes**, GREEN (plafond de la PR 1205, du lot 547).
